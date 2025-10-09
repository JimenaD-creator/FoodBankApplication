import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, getDocs, orderBy, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";

interface Delivery {
  id: string;
  communityName: string;
  municipio: string;
  deliveryDate: any;
  volunteers: { id: string; name: string }[];
  products: any;
  status: "Programada" | "En camino" | "Completada";
}

export default function BeneficiaryDashboard({ navigation }: any) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [userCommunity, setUserCommunity] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    let unsubscribe: any;

    const init = async () => {
      unsubscribe = await loadUserData();
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      setUserName(user.displayName || "Beneficiario");

      // Obtener comunidad del usuario
      const userDoc = await getDocs(
        query(collection(db, "users"), where("__name__", "==", user.uid))
      );

      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        const community = userData.community;
        setUserCommunity(community);

        const unsubscribe = loadDeliveries(community);
        return unsubscribe;
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveries = (community: string) => {
    const q = query(
      collection(db, "scheduledDeliveries"),
      where("communityName", "==", community),
      orderBy("deliveryDate", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();
      const deliveriesList: Delivery[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Delivery, "id">),
        }))
        .filter((d) => d.deliveryDate.toDate() >= now);

      setDeliveries(deliveriesList);
    });

    return unsubscribe;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: any) => {
    const date = timestamp.toDate();
    return date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Programada":
        return "#2196F3";
      case "En camino":
        return "#FF9800";
      case "Completada":
        return "#4CAF50";
      default:
        return "#718096";
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // Próxima entrega
  const nextDelivery = deliveries[0];

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={require("../../../assets/background.jpg")}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="home" size={28} color="#4CAF50" />
            <Text style={styles.title}>Mis Entregas</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => navigation.navigate("ProfileScreen")}
          >
            <Ionicons name="person-circle" size={40} color="#E53E3E" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Bienvenida */}
      <View style={styles.welcomeCard}>
        <Ionicons name="happy" size={20} color="#4CAF50" />
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeTitle}>Hola, {userName} 👋</Text>
          <Text style={styles.welcomeSubtitle}>{userCommunity || "No asignada"}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Próxima entrega */}
        {nextDelivery && (
          <TouchableOpacity
            style={[styles.deliveryCard, { borderLeftColor: getStatusColor(nextDelivery.status) }]}
            onPress={() => navigation.navigate("DeliveryDetails", { delivery: nextDelivery })}
          >
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(nextDelivery.status) }]}>
              <Text style={styles.statusText}>{nextDelivery.status}</Text>
            </View>

            <Text style={{ fontWeight: "600", fontSize: 16, marginBottom: 4 }}>
              Próxima entrega
            </Text>
            <Text>{nextDelivery.communityName}, {nextDelivery.municipio}</Text>
            <Text>
              {formatDate(nextDelivery.deliveryDate)} | {formatTime(nextDelivery.deliveryDate)}
            </Text>
            <TouchableOpacity
              style={{ marginTop: 10, alignSelf: "flex-start" }}
              onPress={() => navigation.navigate("DeliveryDetails", { delivery: nextDelivery })}
            >
              <Text style={{ color: "#2196F3", fontWeight: "600" }}>Ver detalles</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Lista de otras entregas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Otras entregas</Text>
          {deliveries.length > 1 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{deliveries.length - 1}</Text>
            </View>
          )}
        </View>

        {deliveries.length <= 1 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#E2E8F0" />
            <Text style={styles.emptyStateTitle}>No hay más entregas programadas</Text>
          </View>
        ) : (
          deliveries.slice(1).map((delivery) => (
            <View
              key={delivery.id}
              style={[styles.deliveryCard, { borderLeftColor: getStatusColor(delivery.status) }]}
            >
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) }]}>
                <Text style={styles.statusText}>{delivery.status}</Text>
              </View>
              <Text style={{ fontWeight: "600", fontSize: 16, marginBottom: 4 }}>
                {delivery.communityName}, {delivery.municipio}
              </Text>
              <Text>
                {formatDate(delivery.deliveryDate)} | {formatTime(delivery.deliveryDate)}
              </Text>
              {delivery.products && Object.keys(delivery.products).length > 0 && (
                <TouchableOpacity
                  style={{ marginTop: 8 }}
                  onPress={() => navigation.navigate("DeliveryDetails", { delivery })}
                >
                  <Text style={{ color: "#2196F3", fontWeight: "600" }}>
                    Ver contenido de la despensa
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
          ))
        )}
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => navigation.navigate("PreStudyForm")}
        >
          <Text style={styles.button}>Realizar estudio inicial</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7FAFC" },
  headerBackground: { paddingTop: 40, paddingBottom: 20 },
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
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: 20, fontWeight: "bold", color: "#2D3748" },
  avatarContainer: { padding: 5 },
  loadingText: { fontSize: 18, color: "#4A5568", textAlign: "center", marginTop: 50 },
  welcomeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  welcomeTextContainer: { flex: 1 },
  welcomeTitle: { fontSize: 16, color: "#2D3748", fontWeight: "600" },
  welcomeSubtitle: { fontSize: 14, color: "#718096" },
  content: { flex: 1, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginTop: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#2D3748" },
  countBadge: { backgroundColor: "#4CAF50", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 10 },
  countBadgeText: { fontSize: 12, fontWeight: "bold", color: "#fff" },
  emptyState: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 40 },
  emptyStateTitle: { fontSize: 18, fontWeight: "600", color: "#4A5568", marginTop: 16, textAlign: "center" },
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 8 },
  statusText: { fontSize: 12, fontWeight: "600", color: "#fff" },
  button: {backgroundColor: "#FF6B6B",
            paddingVertical: 10,
            borderRadius: 12,
            alignItems: "center",
            textDecorationColor: "#fff",
            color: "#fff",
            fontSize: 18
          }
});
