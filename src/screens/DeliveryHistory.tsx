import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "./firebaseconfig";

interface Delivery {
  id: string;
  communityName: string;
  municipio: string;
  deliveryDate: any;
  volunteers: { id: string; name: string }[];
  products: any;
  status: string;
  familias: number;
}

export default function DeliveryHistoryScreen({ navigation }: any) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("Todas");
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filters = ["Todas", "Completada", "Programada", "Cancelada"];

  useEffect(() => {
    loadDeliveries();
  }, []);

  useEffect(() => {
    filterDeliveries();
  }, [selectedFilter, deliveries]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "scheduledDeliveries"),
        orderBy("deliveryDate", "desc")
      );

      const snapshot = await getDocs(q);
      const deliveriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Delivery));

      setDeliveries(deliveriesData);
    } catch (error) {
      console.error("Error cargando entregas:", error);
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
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatFullDate = (timestamp: any) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: any) => {
    const date = timestamp.toDate();
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completada":
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
      case "Completada":
        return "checkmark-circle";
      case "Programada":
        return "time";
      case "Cancelada":
        return "close-circle";
      default:
        return "help-circle";
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

                <View style={styles.detailRow}>
                  <Ionicons name="people" size={20} color="#FF9800" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Familias beneficiadas</Text>
                    <Text style={styles.detailValue}>
                      {selectedDelivery.familias || 0} familias
                    </Text>
                  </View>
                </View>
              </View>

              {/* Voluntarios */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Voluntarios asignados</Text>
                {selectedDelivery.volunteers.map((volunteer) => (
                  <View key={volunteer.id} style={styles.volunteerDetailCard}>
                    <Ionicons name="person-circle" size={32} color="#4CAF50" />
                    <Text style={styles.volunteerDetailName}>{volunteer.name}</Text>
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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando historial...</Text>
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
          <Text style={styles.headerTitle}>Historial de Entregas</Text>
          <View style={{ width: 24 }} />
        </View>
      </ImageBackground>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{deliveries.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#4CAF50" }]}>
            {deliveries.filter(d => d.status === "Completada").length}
          </Text>
          <Text style={styles.statLabel}>Completadas</Text>
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
              No hay entregas {selectedFilter !== "Todas" ? `con estado "${selectedFilter}"` : ""}
            </Text>
          </View>
        ) : (
          filteredDeliveries.map((delivery) => (
            <TouchableOpacity
              key={delivery.id}
              style={styles.deliveryCard}
              onPress={() => openDetails(delivery)}
              activeOpacity={0.7}
            >
              <View style={styles.deliveryCardHeader}>
                <View style={styles.deliveryCardLeft}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateDay}>
                      {delivery.deliveryDate.toDate().getDate()}
                    </Text>
                    <Text style={styles.dateMonth}>
                      {delivery.deliveryDate.toDate().toLocaleDateString('es-MX', { month: 'short' })}
                    </Text>
                  </View>
                  <View style={styles.deliveryCardInfo}>
                    <Text style={styles.communityName}>{delivery.communityName}</Text>
                    <Text style={styles.municipioName}>{delivery.municipio}</Text>
                  </View>
                </View>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(delivery.status) }]} />
              </View>

              <View style={styles.deliveryCardFooter}>
                <View style={styles.cardInfo}>
                  <Ionicons name="people-outline" size={16} color="#718096" />
                  <Text style={styles.cardInfoText}>
                    {delivery.volunteers.length} voluntario{delivery.volunteers.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Ionicons name="cube-outline" size={16} color="#718096" />
                  <Text style={styles.cardInfoText}>
                    {delivery.products ? Object.keys(delivery.products).length : 0} productos
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
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
  },
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  deliveryCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  deliveryCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dateBox: {
    width: 50,
    height: 50,
    backgroundColor: "#F7FAFC",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
  },
  dateMonth: {
    fontSize: 12,
    color: "#718096",
    textTransform: "uppercase",
  },
  deliveryCardInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 2,
  },
  municipioName: {
    fontSize: 13,
    color: "#718096",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  deliveryCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F7FAFC",
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    gap: 6,
  },
  cardInfoText: {
    fontSize: 13,
    color: "#718096",
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