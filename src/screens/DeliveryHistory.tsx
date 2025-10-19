import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "./firebaseconfig"; 

interface Delivery {
  id: string;
  communityName: string;
  municipio: string;
  deliveryDate: any;
  volunteers: { id: string; name: string }[];
  products: any;
  status: string;
  familias: number;
  beneficiary?: {name: string};
}

export default function DeliveryHistoryScreen({ navigation }: any) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("Todas");
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filters = ["Todas", "Entregado", "Programada", "Cancelada"];
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      loadDeliveries();
    }
  }, [currentUser]);

  useEffect(() => {
    filterDeliveries();
  }, [selectedFilter, deliveries]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      
      if (!currentUser) {
        console.error("No hay usuario logeado");
        setDeliveries([]);
        return;
      }

      console.log("🔍 Buscando entregas para el voluntario:", currentUser.uid);

      const q = query(
        collection(db, "scheduledDeliveries"),
        orderBy("deliveryDate", "desc")
      );

      const snapshot = await getDocs(q);
      const allDeliveries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Delivery));

      console.log("📊 Total de entregas en sistema:", allDeliveries.length);

      const userDeliveries = allDeliveries.filter(delivery => {
        const isVolunteer = delivery.volunteers?.some(volunteer => volunteer.id === currentUser.uid);
        if (isVolunteer) {
          console.log("✅ Encontrada entrega para:", delivery.communityName);
        }
        return isVolunteer;
      });

      console.log("🎯 Entregas asignadas al usuario:", userDeliveries.length);
      setDeliveries(userDeliveries);

    } catch (error) {
      console.error("Error cargando entregas:", error);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDeliveries = () => {
    if (selectedFilter === "Todas") {
      setFilteredDeliveries(deliveries);
    } else {
      setFilteredDeliveries(deliveries.filter(d => d.status === selectedFilter));
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) {
      return "Fecha no disponible";
    }
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatFullDate = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) {
      return "Fecha no disponible";
    }
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) {
      return "Hora no disponible";
    }
    const date = timestamp.toDate();
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Entregado":
        return "#4CAF50";
      case "Programada":
        return "#2196F3";
      case "Cancelada":
        return "#E53E3E";
      default:
        return "#718096";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Entregado":
        return "checkmark-circle";
      case "Programada":
        return "time";
      case "Cancelada":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case "Entregado":
        return "#D1FAE5"; // Verde claro
      case "Programada":
        return "#DBEAFE"; // Azul claro
      case "Cancelada":
        return "#FEE2E2"; // Rojo claro
      default:
        return "#F9FAFB"; // Gris claro
    }
  };

  const getDateBoxColor = (status: string) => {
    switch (status) {
      case "Entregado":
        return "#A7F3D0"; // Verde más intenso
      case "Programada":
        return "#93C5FD"; // Azul más intenso
      case "Cancelada":
        return "#FECACA"; // Rojo más intenso
      default:
        return "#E5E7EB"; // Gris más intenso
    }
  };

  const openDetails = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowDetailsModal(true);
  };

  const renderDetailsModal = () => {
    if (!selectedDelivery) return null;

    const productsArray = selectedDelivery.products
      ? Object.entries(selectedDelivery.products).map(([id, product]: [string, any]) => ({
          id,
          ...product
        }))
      : [];

    return (
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles de la entrega</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Ionicons name="close" size={28} color="#718096" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Status */}
              <View style={[styles.detailStatusBadge, { backgroundColor: getStatusColor(selectedDelivery.status) }]}>
                <Ionicons name={getStatusIcon(selectedDelivery.status)} size={20} color="#fff" />
                <Text style={styles.detailStatusText}>{selectedDelivery.status}</Text>
              </View>

              {/* Info básica */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Información general</Text>
                
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={20} color="#4CAF50" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Comunidad</Text>
                    <Text style={styles.detailValue}>
                      {selectedDelivery.communityName}, {selectedDelivery.municipio}
                    </Text>
                  </View>
                </View>

                {selectedDelivery.beneficiary?.name && (
                  <View style={styles.detailRow}>
                    <Ionicons name="person" size={20} color="#9C27B0" />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Beneficiario</Text>
                      <Text style={styles.detailValue}>
                        {selectedDelivery.beneficiary.name}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={20} color="#2196F3" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Fecha y hora</Text>
                    <Text style={styles.detailValue}>
                      {formatFullDate(selectedDelivery.deliveryDate)}
                    </Text>
                    <Text style={styles.detailSubValue}>
                      {formatTime(selectedDelivery.deliveryDate)}
                    </Text>
                  </View>
                </View>

              </View>

              {/* Voluntarios */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Voluntarios asignados</Text>
                {selectedDelivery.volunteers?.map((volunteer) => (
                  <View key={volunteer.id} style={styles.volunteerDetailCard}>
                    <Ionicons name="person-circle" size={32} color="#4CAF50" />
                    <Text style={styles.volunteerDetailName}>
                      {volunteer.name}
                      {volunteer.id === currentUser?.uid && " (Tú)"}
                    </Text>
                  </View>
                ))}
              </View>
              

              {/* Productos */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  Contenido de la despensa ({productsArray.length} productos)
                </Text>
                {productsArray.map((product, index) => (
                  <View key={index} style={styles.productDetailRow}>
                    <View style={styles.productDetailIcon}>
                      <Ionicons name="cube" size={16} color="#4CAF50" />
                    </View>
                    <Text style={styles.productDetailName}>{product.name}</Text>
                    <Text style={styles.productDetailQuantity}>
                      {product.quantity} {product.unit}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowDetailsModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>No hay usuario logeado</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando tus entregas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground 
        source={require('../../assets/background.jpg')}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Entregas</Text>
          <View style={{ width: 24 }} />
        </View>
      </ImageBackground>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{deliveries.length}</Text>
          <Text style={styles.statLabel}>Mis Entregas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#4CAF50" }]}>
            {deliveries.filter(d => d.status === "Entregado").length}
          </Text>
          <Text style={styles.statLabel}>Entregadas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#2196F3" }]}>
            {deliveries.filter(d => d.status === "Programada").length}
          </Text>
          <Text style={styles.statLabel}>Programadas</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              selectedFilter === filter && styles.filterChipSelected
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter && styles.filterTextSelected
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <ScrollView style={styles.content}>
        {filteredDeliveries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="archive-outline" size={64} color="#E2E8F0" />
            <Text style={styles.emptyStateText}>
              {selectedFilter === "Todas" 
                ? "No tienes entregas asignadas" 
                : `No tienes entregas ${selectedFilter.toLowerCase()}`
              }
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={loadDeliveries}
            >
              <Ionicons name="refresh" size={16} color="#4CAF50" />
              <Text style={styles.retryButtonText}>Actualizar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredDeliveries.map((delivery) => (
            <TouchableOpacity
              key={delivery.id}
              style={[
                styles.deliveryCard,
                { backgroundColor: getStatusBackgroundColor(delivery.status) }
              ]}
              onPress={() => openDetails(delivery)}
              activeOpacity={0.7}
            >
              <View style={styles.deliveryCardHeader}>
                <View style={styles.deliveryCardLeft}>
                  <View style={[
                    styles.dateBox,
                    { backgroundColor: getDateBoxColor(delivery.status) }
                  ]}>
                    <Text style={styles.dateDay}>
                      {delivery.deliveryDate?.toDate()?.getDate() || "?"}
                    </Text>
                    <Text style={styles.dateMonth}>
                      {delivery.deliveryDate?.toDate()?.toLocaleDateString('es-MX', { month: 'short' }) || "Fecha"}
                    </Text>
                  </View>
                  <View style={styles.deliveryCardInfo}>
                    <Text style={styles.communityName}>{delivery.communityName}</Text>
                    <Text style={styles.municipioName}>{delivery.municipio}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) }]}>
                  <Ionicons name={getStatusIcon(delivery.status)} size={16} color="#fff" />
                </View>
              </View>

              <View style={styles.deliveryCardFooter}>
                <View style={styles.cardInfo}>
                  <View style={styles.cardInfoIconContainer}>
                    <Ionicons name="people" size={16} color="#6B7280" />
                  </View>
                  <Text style={styles.cardInfoText}>
                    {delivery.volunteers?.length || 0} voluntario{delivery.volunteers?.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.cardInfoIconContainer}>
                    <Ionicons name="cube" size={16} color="#6B7280" />
                  </View>
                  <Text style={styles.cardInfoText}>
                    {delivery.products ? Object.keys(delivery.products).length : 0} productos
                  </Text>
                </View>
                <View style={styles.viewDetailsContainer}>
                  <Text style={styles.viewDetailsText}>Ver detalles</Text>
                  <Ionicons name="chevron-forward" size={18} color="#6B7280" />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {renderDetailsModal()}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E53E3E",
  },
  loadingText: {
    fontSize: 18,
    color: "#4A5568",
    textAlign: "center",
    marginTop: 50,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "500",
  },
  filtersScroll: {
    maxHeight: 60,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  filterText: {
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "500",
  },
  filterTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#A0AEC0",
    marginTop: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  retryButtonText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  deliveryCard: {
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  deliveryCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  deliveryCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dateBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  dateMonth: {
    fontSize: 11,
    color: "#4B5563",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  deliveryCardInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  municipioName: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.5)",
    gap: 12,
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardInfoIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfoText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  viewDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F7FAFC",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3748",
  },
  modalBody: {
    padding: 20,
  },
  detailStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 20,
  },
  detailStatusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3748",
  },
  detailSubValue: {
    fontSize: 13,
    color: "#4A5568",
    marginTop: 2,
  },
  volunteerDetailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
  },
  volunteerDetailName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2D3748",
  },
  productDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F7FAFC",
  },
  productDetailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  productDetailName: {
    flex: 1,
    fontSize: 14,
    color: "#2D3748",
  },
  productDetailQuantity: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },
  closeModalButton: {
    backgroundColor: "#E53E3E",
    padding: 18,
    margin: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  closeModalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});