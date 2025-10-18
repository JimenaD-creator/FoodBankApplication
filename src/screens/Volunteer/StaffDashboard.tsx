import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, RefreshControl, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";

interface AssignedDelivery {
  id: string;
  communityName: string;
  municipio: string;
  deliveryDate: any;
  status: string;
  familias: number;
}

export default function StaffDashboard({ navigation }: any) {
  const [assignedDeliveries, setAssignedDeliveries] = useState<AssignedDelivery[]>([]);
  const [todayDeliveries, setTodayDeliveries] = useState<AssignedDelivery[]>([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<AssignedDelivery[]>([]);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    communitiesCount: 0,
    beneficiariesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Obtener nombre del usuario
      const userSnapshot = await getDocs(
        query(collection(db, "users"), where("__name__", "==", user.uid))
      );
      
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        setUserName(userData.fullName || "Voluntario");
      }

      // Buscar entregas asignadas a este voluntario
      const deliveriesSnapshot = await getDocs(collection(db, "scheduledDeliveries"));
      
      const assignedToMe = deliveriesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(delivery => 
          delivery.volunteers?.some((v: any) => v.id === user.uid)
        );

      setAssignedDeliveries(assignedToMe);

      // Separar entregas de hoy y próximas
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayList = assignedToMe.filter(d => {
        const deliveryDate = d.deliveryDate.toDate();
        return deliveryDate >= today && deliveryDate < tomorrow;
      });

      const upcomingList = assignedToMe.filter(d => {
        const deliveryDate = d.deliveryDate.toDate();
        return deliveryDate >= tomorrow;
      }).sort((a, b) => a.deliveryDate.toDate() - b.deliveryDate.toDate());

      setTodayDeliveries(todayList);
      setUpcomingDeliveries(upcomingList);

      // ✅ CORREGIDO: Contar solo beneficiarios de las comunidades asignadas al staff
      const uniqueCommunityNames = Array.from(new Set(assignedToMe.map(d => d.communityName)));
      
      console.log("🏘️ Comunidades asignadas:", uniqueCommunityNames);
      
      let totalBeneficiaries = 0;

      if (uniqueCommunityNames.length > 0) {
        // Para cada comunidad, contar los beneficiarios
        for (const communityName of uniqueCommunityNames) {
          try {
            const beneficiariesSnapshot = await getDocs(
              query(
                collection(db, "users"), 
                where("role", "==", "beneficiary"),
                where("community", "==", communityName)
              )
            );
            totalBeneficiaries += beneficiariesSnapshot.size;
            console.log(`👥 Beneficiarios en ${communityName}:`, beneficiariesSnapshot.size);
          } catch (error) {
            console.error(`Error contando beneficiarios de ${communityName}:`, error);
          }
        }
      }

      // Calcular estadísticas
      const uniqueCommunities = new Set(assignedToMe.map(d => d.communityName));

      setStats({
        totalAssignments: assignedToMe.length,
        communitiesCount: uniqueCommunities.size,
        beneficiariesCount: totalBeneficiaries, // ✅ Ahora cuenta solo beneficiarios de comunidades asignadas
      });

      console.log("📊 Estadísticas finales:", {
        entregas: assignedToMe.length,
        comunidades: uniqueCommunities.size,
        beneficiarios: totalBeneficiaries
      });

    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (timestamp: any) => {
    const date = timestamp.toDate();
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground 
        source={require('../../../assets/background.jpg')}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image 
              source={require('../../../assets/logo_no_background.png')} 
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.greetingText}>Hola,</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => navigation.navigate("ProfileScreen")}
          >
            <Image
              source={require("../../../assets/usuario.png")} 
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="calendar" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{stats.totalAssignments}</Text>
            <Text style={styles.statLabel}>Entregas asignadas</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="location" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{stats.communitiesCount}</Text>
            <Text style={styles.statLabel}>Comunidades</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="people" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{stats.beneficiariesCount}</Text>
            <Text style={styles.statLabel}>Beneficiarios</Text>
          </View>
        </View>

        {/* Today's deliveries */}
        {todayDeliveries.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flame" size={20} color="#E53E3E" />
              <Text style={styles.sectionTitle}>Entregas de hoy</Text>
            </View>

            {todayDeliveries.map((delivery) => (
              <TouchableOpacity
                key={delivery.id}
                style={styles.todayDeliveryCard}
                onPress={() => navigation.navigate("StaffDelivery", { delivery })}
              >
                <View style={styles.todayDeliveryHeader}>
                  <View style={styles.todayDeliveryTime}>
                    <Ionicons name="time" size={18} color="#E53E3E" />
                    <Text style={styles.todayDeliveryTimeText}>
                      {formatTime(delivery.deliveryDate)}
                    </Text>
                  </View>
                  <View style={[styles.urgentBadge]}>
                    <Text style={styles.urgentBadgeText}>¡HOY!</Text>
                  </View>
                </View>
                <Text style={styles.todayDeliveryLocation}>
                  {delivery.communityName}, {delivery.municipio}
                </Text>
                <Text style={styles.todayDeliveryFamilies}>
                  {delivery.familias} familias
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming deliveries */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximas entregas</Text>

          {upcomingDeliveries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#E2E8F0" />
              <Text style={styles.emptyStateText}>No tienes entregas programadas</Text>
            </View>
          ) : (
            upcomingDeliveries.map((delivery) => (
              <TouchableOpacity
                key={delivery.id}
                style={styles.deliveryCard}
                onPress={() => navigation.navigate("StaffDelivery", { delivery })}
              >
                <View style={styles.deliveryDateBadge}>
                  <Text style={styles.deliveryDateText}>
                    {formatDate(delivery.deliveryDate)}
                  </Text>
                </View>
                <View style={styles.deliveryInfo}>
                  <View style={styles.deliveryLocation}>
                    <Ionicons name="location" size={18} color="#4CAF50" />
                    <Text style={styles.deliveryLocationText}>
                      {delivery.communityName}
                    </Text>
                  </View>
                  <Text style={styles.deliveryMunicipio}>{delivery.municipio}</Text>
                  <View style={styles.deliveryMeta}>
                    <Ionicons name="time-outline" size={16} color="#718096" />
                    <Text style={styles.deliveryMetaText}>
                      {formatTime(delivery.deliveryDate)}
                    </Text>
                    <Ionicons name="people-outline" size={16} color="#718096" style={{ marginLeft: 12 }} />
                    <Text style={styles.deliveryMetaText}>
                      {delivery.familias} familias
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Herramientas</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("AssignedCommunities")}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="map" size={24} color="#4CAF50" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Mis comunidades</Text>
              <Text style={styles.actionSubtitle}>Ver comunidades asignadas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("StaffBeneficiariesList")}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="people" size={24} color="#2196F3" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Lista de beneficiarios</Text>
              <Text style={styles.actionSubtitle}>Consultar información</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("DeliveryHistory")}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="cube" size={24} color="#FF9800" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Historial de entregas</Text>
              <Text style={styles.actionSubtitle}>Ver entregas completadas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("SocioEconomicSurvey")}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="clipboard" size={24} color="#E53E3E" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Estudio socioeconómico</Text>
              <Text style={styles.actionSubtitle}>Realizar cuestionario completo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  headerBackground: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerLogo: {
    width: 40,
    height: 40,
  },
  greetingText: {
    fontSize: 12,
    color: "#718096",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: "#E53E3E",
    borderRadius: 20,
    padding: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  loadingText: {
    fontSize: 18,
    color: "#4A5568",
    textAlign: "center",
    marginTop: 50,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
  },
  statLabel: {
    fontSize: 11,
    color: "#4A5568",
    textAlign: "center",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 16,
  },
  todayDeliveryCard: {
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#E53E3E",
  },
  todayDeliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  todayDeliveryTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  todayDeliveryTimeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E53E3E",
  },
  urgentBadge: {
    backgroundColor: "#E53E3E",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgentBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fff",
  },
  todayDeliveryLocation: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4,
  },
  todayDeliveryFamilies: {
    fontSize: 13,
    color: "#718096",
  },
  deliveryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  deliveryDateBadge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  deliveryDateText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    textTransform: "uppercase",
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  deliveryLocationText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3748",
  },
  deliveryMunicipio: {
    fontSize: 13,
    color: "#718096",
    marginBottom: 6,
  },
  deliveryMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deliveryMetaText: {
    fontSize: 12,
    color: "#718096",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#A0AEC0",
    marginTop: 12,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#718096",
  },
});