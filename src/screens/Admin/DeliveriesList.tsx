import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { db } from '../firebaseconfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function DeliveryListScreen({ navigation }: any) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedBeneficiary, setExpandedBeneficiary] = useState<string | null>(null);

  // Obtener entregas y beneficiarios
  const fetchDeliveries = async () => {
    try {
      setLoading(true);

      const scheduledDeliveriesRef = collection(db, 'scheduledDeliveries');
      const scheduledSnapshot = await getDocs(scheduledDeliveriesRef);

      const usersRef = collection(db, 'users');
      const beneficiariesQuery = query(usersRef, where('role', '==', 'beneficiary'));
      const beneficiariesSnapshot = await getDocs(beneficiariesQuery);

      const beneficiariesMap = {};
      beneficiariesSnapshot.forEach(doc => {
        beneficiariesMap[doc.id] = { id: doc.id, ...doc.data() };
      });

      const deliveriesData = [];

      scheduledSnapshot.forEach(doc => {
        const delivery = doc.data();

        const matchingBeneficiaries = Object.values(beneficiariesMap).filter(
          (b: any) => b.community?.toLowerCase?.() === delivery.communityName?.toLowerCase?.()
        );

        matchingBeneficiaries.forEach((beneficiary: any) => {
          deliveriesData.push({
            id: `${doc.id}_${beneficiary.id}`,
            deliveryId: doc.id,
            beneficiaryId: beneficiary.id,
            beneficiaryName: beneficiary.fullName || beneficiary.name || 'Sin nombre',
            deliveryDate: delivery.deliveryDate,
            status: delivery.status || 'Pendiente',
            communityName: delivery.communityName || '',
            products: delivery.products || [],
            familias: delivery.familias || 0,
            municipio: delivery.municipio || ''
          });
        });
      });

      // Agrupar por beneficiario
      const groupedDeliveries = Object.values(
        deliveriesData.reduce((acc: any, delivery: any) => {
          if (!acc[delivery.beneficiaryId]) {
            acc[delivery.beneficiaryId] = {
              beneficiaryId: delivery.beneficiaryId,
              beneficiaryName: delivery.beneficiaryName,
              communityName: delivery.communityName,
              deliveries: []
            };
          }
          acc[delivery.beneficiaryId].deliveries.push(delivery);
          return acc;
        }, {})
      );

      setDeliveries(groupedDeliveries);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las entregas: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeliveries();
  };

  const formatDate = (date) => {
    if (!date) return 'Pendiente';
    if (date.toDate) {
      const d = date.toDate();
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
    if (typeof date === 'string') return date;
    return 'Pendiente';
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'entregado' || statusLower === 'completado') return '#C6F6D5';
    else if (statusLower === 'parcial') return '#FEFCBF';
    return '#FED7D7';
  };

  const getStatusIcon = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'entregado' || statusLower === 'completado' || statusLower === 'parcial')
      return 'checkmark-circle';
    return 'alert-circle';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53E3E" />
        <Text style={styles.loadingText}>Cargando entregas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoEmoji}>🍎</Text>
          </View>
          <View>
            <Text style={styles.logoTextRed}>RED</Text>
            <Text style={styles.logoTextBamx}>BAMX</Text>
          </View>
        </View>
      </View>

      <View style={styles.titleSection}>
        <Ionicons name="people-circle-outline" size={24} color="#2D3748" />
        <Text style={styles.title}>Lista de entregas</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {deliveries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#CBD5E0" />
            <Text style={styles.emptyText}>No hay entregas programadas</Text>
          </View>
        ) : (
          deliveries.map((beneficiary: any) => (
            <View key={beneficiary.beneficiaryId} style={styles.beneficiaryCard}>
              <TouchableOpacity
                style={styles.beneficiaryHeader}
                onPress={() =>
                  setExpandedBeneficiary(
                    expandedBeneficiary === beneficiary.beneficiaryId ? null : beneficiary.beneficiaryId
                  )
                }
              >
                <Text style={styles.beneficiaryName}>{beneficiary.beneficiaryName}</Text>
                <View style={styles.beneficiaryInfo}>
                  <Ionicons
                    name={expandedBeneficiary === beneficiary.beneficiaryId ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color="#2D3748"
                  />
                </View>
              </TouchableOpacity>

              {expandedBeneficiary === beneficiary.beneficiaryId && (
                <View style={styles.deliveryList}>
                  {beneficiary.deliveries.map((delivery: any) => (
                    <TouchableOpacity
                      key={delivery.id}
                      style={[styles.deliveryCard, { backgroundColor: getStatusColor(delivery.status) }]}
                      onPress={() => navigation.navigate('DeliveryDetails', { delivery })}
                    >
                      <View style={styles.deliveryRow}>
                        <Ionicons name={getStatusIcon(delivery.status)} size={18} color="#2D3748" />
                        <Text style={styles.deliveryText}>
                          {formatDate(delivery.deliveryDate)} — {delivery.status}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
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
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  backButton: { padding: 5 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E53E3E",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  headerActions: { flexDirection: "row" },
  headerActionButton: { padding: 5, marginLeft: 10 },

  // Sección principal
  content: { flex: 1, padding: 20 },
  scrollView: { marginTop: 10 },
  listContainer: { paddingBottom: 20 },

  // Tarjeta de beneficiario
  beneficiaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  beneficiaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  beneficiaryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
  },
  beneficiaryInfo: { flexDirection: "row", alignItems: "center" },

  // Lista de entregas dentro del acordeón
  deliveryList: { paddingHorizontal: 12, paddingBottom: 12 },
  deliveryCard: {
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  deliveryRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  deliveryText: { fontSize: 14, color: "#2D3748", marginLeft: 4 },

  // Badge de estado de entrega
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  statusText: { fontSize: 11, fontWeight: "600", color: "#fff", marginLeft: 4 },

  // Estado vacío / sin datos
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A5568",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

