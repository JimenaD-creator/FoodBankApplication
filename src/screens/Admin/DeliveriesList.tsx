import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Alert, ImageBackground } from 'react-native';
import { useState, useEffect } from 'react';
import { db } from '../firebaseconfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function DeliveryListScreen({ navigation }: any) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedBeneficiary, setExpandedBeneficiary] = useState<string | null>(null);
  const [filter, setFilter] = useState('todas'); // todas, programadas, completadas

  const fetchDeliveries = async () => {
  try {
    setLoading(true);

    const scheduledDeliveriesRef = collection(db, 'scheduledDeliveries');
    const scheduledSnapshot = await getDocs(scheduledDeliveriesRef);

    const usersRef = collection(db, 'users');
    const beneficiariesQuery = query(usersRef, where('role', '==', 'beneficiary'));
    const beneficiariesSnapshot = await getDocs(beneficiariesQuery);

    const beneficiariesMap: any = {};
    beneficiariesSnapshot.forEach(doc => {
      beneficiariesMap[doc.id] = { id: doc.id, ...doc.data() };
    });

    const deliveriesData: any[] = [];

    // Procesar cada documento de entrega individual
    scheduledSnapshot.forEach(doc => {
      const delivery = doc.data();
      
      // Obtener el beneficiario específico de esta entrega
      const beneficiary = beneficiariesMap[delivery.beneficiary?.id];
      
      if (beneficiary) {
        deliveriesData.push({
          id: doc.id, // Usar el ID único de la entrega
          deliveryId: doc.id,
          beneficiaryId: beneficiary.id,
          beneficiaryName: beneficiary.fullName || beneficiary.name || 'Sin nombre',
          deliveryDate: delivery.deliveryDate,
          status: delivery.status || 'Pendiente',
          communityName: delivery.communityName || '',
          products: delivery.products || {},
          familias: delivery.familias || 0,
          municipio: delivery.municipio || '',
          volunteers: delivery.volunteers || [],
          // Mantener la referencia al objeto beneficiary original si es necesario
          beneficiaryData: beneficiary
        });
      } else {
        console.warn('Beneficiario no encontrado para la entrega:', doc.id, delivery.beneficiary?.id);
      }
    });

    // Agrupar por beneficiario (solo las entregas que le corresponden)
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
  } catch (error: any) {
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

  const formatDate = (date: any) => {
    if (!date) return 'Pendiente';
    if (date.toDate) {
      const d = date.toDate();
      return d.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
    return 'Pendiente';
  };

  const formatTime = (date: any) => {
    if (!date) return '';
    if (date.toDate) {
      const d = date.toDate();
      return d.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return '';
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'entregado' || statusLower === 'Entregado') return '#FF9800';
    if (statusLower === 'en camino') return '#FF9800';
    if (statusLower === 'programada') return '#2196F3';
    return '#718096';
  };

  const getStatusBgColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'entregado' || statusLower === 'Entregado') return 'rgba(255, 235, 153, 0.95)';
    if (statusLower === 'en camino') return 'rgba(255, 152, 0, 0.1)';
    if (statusLower === 'programada') return 'rgba(33, 150, 243, 0.1)';
    return 'rgba(113, 128, 150, 0.1)';
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'entregado' || statusLower === 'Entregado') return 'checkmark-circle';
    if (statusLower === 'en camino') return 'car';
    if (statusLower === 'programada') return 'calendar';
    return 'time';
  };

  const filteredDeliveries = deliveries.map((beneficiary: any) => ({
  ...beneficiary,
  deliveries: (beneficiary.deliveries || []).filter((d: any) => {
    if (filter === 'todas') return true;
    if (filter === 'programadas') return d.status?.toLowerCase() === 'programada';
    if (filter === 'completadas') return d.status?.toLowerCase() === 'Entregado' || d.status?.toLowerCase() === 'entregado';
    return true;
  })
})).filter((b: any) => (b.deliveries || []).length > 0);

  const totalDeliveries = deliveries.reduce(
  (acc: number, b: any) => acc + (b.deliveries ? b.deliveries.length : 0),
  0
);


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
      {/* Header */}
      <ImageBackground 
        source={require('../../../assets/background.jpg')}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Entregas por Beneficiario</Text>
          <View style={{ width: 24 }} />
        </View>
      </ImageBackground>

      {/* Stats cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{deliveries.length}</Text>
          <Text style={styles.statLabel}>Beneficiarios</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cube" size={24} color="#2196F3" />
          <Text style={styles.statValue}>{totalDeliveries}</Text>
          <Text style={styles.statLabel}>Entregas</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'todas' && styles.filterChipActive]}
            onPress={() => setFilter('todas')}
          >
            <Text style={[styles.filterText, filter === 'todas' && styles.filterTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'programadas' && styles.filterChipActive]}
            onPress={() => setFilter('programadas')}
          >
            <Text style={[styles.filterText, filter === 'programadas' && styles.filterTextActive]}>
              Programadas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'completadas' && styles.filterChipActive]}
            onPress={() => setFilter('completadas')}
          >
            <Text style={[styles.filterText, filter === 'completadas' && styles.filterTextActive]}>
              Completadas
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredDeliveries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#CBD5E0" />
            <Text style={styles.emptyText}>No hay entregas</Text>
            <Text style={styles.emptySubtext}>
              {filter !== 'todas' 
                ? `No hay entregas ${filter} en este momento`
                : 'No hay entregas programadas'}
            </Text>
          </View>
        ) : (
          filteredDeliveries.map((beneficiary: any) => (
            <View key={beneficiary.beneficiaryId} style={styles.beneficiaryCard}>
              <TouchableOpacity
                style={styles.beneficiaryHeader}
                onPress={() =>
                  setExpandedBeneficiary(
                    expandedBeneficiary === beneficiary.beneficiaryId ? null : beneficiary.beneficiaryId
                  )
                }
                activeOpacity={0.7}
              >
                <View style={styles.beneficiaryMainInfo}>
                  <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.beneficiaryTextContainer}>
                    <Text style={styles.beneficiaryName}>{beneficiary.beneficiaryName}</Text>
                    <View style={styles.communityRow}>
                      <Ionicons name="location" size={14} color="#718096" />
                      <Text style={styles.communityText}>{beneficiary.communityName}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.beneficiaryActions}>
                  <View style={styles.deliveryCountBadge}>
                    <Text style={styles.deliveryCountText}>{beneficiary.deliveries.length}</Text>
                  </View>
                  <Ionicons
                    name={expandedBeneficiary === beneficiary.beneficiaryId ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#718096"
                  />
                </View>
              </TouchableOpacity>

              {expandedBeneficiary === beneficiary.beneficiaryId && (
                <View style={styles.deliveryList}>
                  {beneficiary.deliveries.map((delivery: any, index: number) => (
                    <TouchableOpacity
                      key={delivery.id}
                      style={[styles.deliveryCard, { backgroundColor: getStatusBgColor(delivery.status) }]}
                      onPress={() => {
                        const isCompleted = delivery.status?.toLowerCase() === 'completada' ||
                        delivery.status?.toLowerCase() == 'entregada' ||
                        delivery.status?.toLowerCase() === 'entregado';

                        if(isCompleted){
                          navigation.navigate('BeneficiaryAttendance', {deliveryId: delivery.deliveryId});
                        }else{
                           Alert.alert(
                              'Entrega Pendiente',
                              'La información de asistencia estará disponible cuando la entrega esté completada.',
                              [{ text: 'Entendido' }]
                            );

                        }


                      }}
                        activeOpacity={0.7}

                       
                    >
                      <View style={styles.deliveryHeader}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) }]}>
                          <Ionicons name={getStatusIcon(delivery.status)} size={14} color="#fff" />
                          <Text style={styles.statusText}>{delivery.status}</Text>
                        </View>
                      </View>

                      <View style={styles.deliveryInfo}>
                        <View style={styles.deliveryInfoRow}>
                          <Ionicons name="calendar-outline" size={18} color="#c93716" />
                          <Text style={styles.deliveryInfoText}>{formatDate(delivery.deliveryDate)}</Text>
                        </View>
                        <View style={styles.deliveryInfoRow}>
                          <Ionicons name="time-outline" size={18} color="#FF9800" />
                          <Text style={styles.deliveryInfoText}>{formatTime(delivery.deliveryDate)}</Text>
                        </View>
                      </View>

                      {delivery.products && Object.keys(delivery.products).length > 0 && (
                        <View style={styles.productsInfo}>
                          <Ionicons name="cube-outline" size={16} color="#718096" />
                          <Text style={styles.productsInfoText}>
                            {Object.keys(delivery.products).length} productos
                          </Text>
                        </View>
                      )}

                      {delivery.volunteers && delivery.volunteers.length > 0 && (
                        <View style={styles.volunteersInfo}>
                          <Ionicons name="people-outline" size={16} color="#718096" />
                          <Text style={styles.volunteersInfoText}>
                            {delivery.volunteers.map((v: any) => v.name).join(', ')}
                          </Text>
                        </View>
                      )}

                      <View style={styles.viewDetailsRow}>
                         <Text style={[
    styles.viewDetailsText,
    (delivery.status?.toLowerCase() !== 'completada' && 
     delivery.status?.toLowerCase() !== 'entregada' &&
     delivery.status?.toLowerCase() !== 'entregado') && 
    { color: '#718096' }
  ]}>
    {(delivery.status?.toLowerCase() === 'completada' || 
      delivery.status?.toLowerCase() === 'entregada' ||
      delivery.status?.toLowerCase() === 'entregado')
      ? 'Ver asistencia'
      : 'Sin información disponible'}
  </Text>
  <Ionicons 
    name={(delivery.status?.toLowerCase() === 'completada' || 
           delivery.status?.toLowerCase() === 'entregada' ||
           delivery.status?.toLowerCase() === 'entregado')
      ? "chevron-forward" 
      : "lock-closed"} 
    size={16} 
    color={(delivery.status?.toLowerCase() === 'completada' || 
            delivery.status?.toLowerCase() === 'entregada' ||
            delivery.status?.toLowerCase() === 'entregado')
      ? "#2196F3" 
      : "#718096"} 
  />
                        
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
    backgroundColor: "#F7FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4A5568",
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E53E3E",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#718096",
    marginTop: 4,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  filterText: {
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  beneficiaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    overflow: "hidden",
  },
  beneficiaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  beneficiaryMainInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  beneficiaryTextContainer: {
    flex: 1,
  },
  beneficiaryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4,
  },
  communityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  communityText: {
    fontSize: 13,
    color: "#718096",
  },
  beneficiaryActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deliveryCountBadge: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
  },
  deliveryCountText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  deliveryList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
    backgroundColor: "#F7FAFC",
  },
  deliveryCard: {
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },
  deliveryHeader: {
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  deliveryInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  deliveryInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deliveryInfoText: {
    fontSize: 13,
    color: "#4A5568",
    fontWeight: "500",
  },
  productsInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  productsInfoText: {
    fontSize: 12,
    color: "#718096",
  },
  volunteersInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  volunteersInfoText: {
    fontSize: 12,
    color: "#718096",
    flex: 1,
  },
  viewDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 4,
  },
  viewDetailsText: {
    fontSize: 13,
    color: "#c93716",
    fontWeight: "500",
  },
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
  },
  emptySubtext: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
    textAlign: "center",
  },
});