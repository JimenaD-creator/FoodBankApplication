import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ImageBackground, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseconfig";

const PRODUCT_CATEGORIES = [
  { id: "canasta_basica", name: "Canasta básica", color: "#FFE8CC", icon: "basket", gradient: ["#FFE8CC", "#FFD9A6"] },
  { id: "fruta_verdura", name: "Fruta y verdura", color: "#D4EDDA", icon: "leaf", gradient: ["#D4EDDA", "#C3E6CB"] },
  { id: "carne_lacteos", name: "Carne, embutido, lácteos", color: "#FFEBEE", icon: "restaurant", gradient: ["#FFEBEE", "#FFCDD2"] },
  { id: "abarrotes", name: "Abarrotes", color: "#FFF9C4", icon: "cart", gradient: ["#FFF9C4", "#FFF59D"] },
  { id: "no_alimenticios", name: "No alimenticios", color: "#E3F2FD", icon: "cube", gradient: ["#E3F2FD", "#BBDEFB"] }
];

interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number; 
}

interface Delivery {
  id: string;
  communityName: string;
  municipio: string;
  deliveryDate: any;
  products: { [productId: string]: { quantity: number } };
  status: string;
  beneficiary: {
    id: string;
    name: string;
  };
  volunteers: Array<{ id: string; name: string }>;
}

interface Props {
  route: { params: { delivery: Delivery } };
  navigation: any;
}

export default function StaffDelivery({ route, navigation }: any) {
  const { delivery } = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const templateDoc = await getDoc(doc(db, "deliveries", "standardTemplate"));
        if (!templateDoc.exists()) {
          Alert.alert("Error", "No se encontró la plantilla estándar de productos.");
          return;
        }

        const templateData = templateDoc.data().products || {};
        const productArray: Product[] = Object.entries(templateData).map(([id, p]: any) => ({
          id,
          name: p.name,
          category: p.category,
          unit: p.unit,
          quantity: delivery.products[id]?.quantity || 0
        }));

        setProducts(productArray);
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar la información de la despensa.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [delivery.products]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const groupedProducts = PRODUCT_CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = products.filter((p) => p.category === cat.id);
    return acc;
  }, {} as Record<string, Product[]>);

  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString("es-MX", { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timestamp: any) => {
    return timestamp.toDate().toLocaleTimeString("es-MX", { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completada' || statusLower === 'entregada' || statusLower === 'entregado') return '#10B981';
    if (statusLower === 'en camino') return '#F59E0B';
    if (statusLower === 'programada') return '#3B82F6';
    return '#6B7280';
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completada' || statusLower === 'entregada' || statusLower === 'entregado') return 'checkmark-circle';
    if (statusLower === 'en camino') return 'car';
    if (statusLower === 'programada') return 'calendar';
    return 'time';
  };

  const getVolunteersText = (volunteers: Array<{ id: string; name: string }>) => {
    if (!volunteers || volunteers.length === 0) {
      return "No asignado";
    }
    
    if (volunteers.length === 1) {
      return volunteers[0].name;
    }
    
    return `${volunteers.length} voluntarios`;
  };

  const totalProducts = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalCategories = PRODUCT_CATEGORIES.filter(cat => groupedProducts[cat.id]?.length > 0).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53E3E" />
        <Text style={styles.loadingText}>Cargando información de entrega...</Text>
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
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Entrega Programada</Text>
            <Text style={styles.headerSubtitle}>Detalle de productos</Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </ImageBackground>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.iconBadge}>
              <Ionicons name="location" size={24} color="#E53E3E" />
            </View>
            <View style={styles.infoHeaderText}>
              <Text style={styles.communityName}>{delivery.communityName}</Text>
              <Text style={styles.municipio}>{delivery.municipio}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Sección del Beneficiario */}
          <View style={styles.beneficiarySection}>
            <View style={styles.beneficiaryHeader}>
              <Ionicons name="person" size={18} color="#4CAF50" />
              <Text style={styles.beneficiaryTitle}>Beneficiario</Text>
            </View>
            <View style={styles.beneficiaryInfo}>
              <Text style={styles.beneficiaryName}>
                {delivery.beneficiary?.name || "Nombre no disponible"}
              </Text>
             
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={[styles.detailIconContainer, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Fecha</Text>
                <Text style={styles.detailValue}>{formatDate(delivery.deliveryDate)}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={[styles.detailIconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="time-outline" size={20} color="#F59E0B" />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Hora</Text>
                <Text style={styles.detailValue}>{formatTime(delivery.deliveryDate)}</Text>
              </View>
            </View>

          
          </View>

          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) }]}>
              <Ionicons name={getStatusIcon(delivery.status)} size={16} color="#fff" />
              <Text style={styles.statusText}>{delivery.status}</Text>
            </View>
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Productos por categoría</Text>

          {PRODUCT_CATEGORIES.map((cat) => {
            const catProducts = groupedProducts[cat.id] || [];
            const isExpanded = expandedCategories.has(cat.id);
            
            if (catProducts.length === 0) return null;

            return (
              <View key={cat.id} style={styles.categoryCard}>
                <TouchableOpacity 
                  style={[styles.categoryHeader, { backgroundColor: cat.color }]}
                  onPress={() => toggleCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryHeaderLeft}>
                    <View style={styles.categoryIconContainer}>
                      <Ionicons name={cat.icon as any} size={22} color="#2D3748" />
                    </View>
                    <View>
                      <Text style={styles.categoryName}>{cat.name}</Text>
                      <Text style={styles.categoryCount}>{catProducts.length} productos</Text>
                    </View>
                  </View>
                  
                  <View style={styles.categoryHeaderRight}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {catProducts.reduce((sum, p) => sum + p.quantity, 0)}
                      </Text>
                    </View>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#4B5563" 
                    />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.categoryContent}>
                    {catProducts.map((p, index) => (
                      <View 
                        key={p.id} 
                        style={[
                          styles.productRow,
                          index === catProducts.length - 1 && styles.productRowLast
                        ]}
                      >
                        <View style={styles.productCheckbox}>
                          <Ionicons name="checkmark" size={16} color="#10B981" />
                        </View>
                        <Text style={styles.productName}>{p.name}</Text>
                        <View style={styles.productQuantityBadge}>
                          <Text style={styles.productQuantity}>{p.quantity} {p.unit}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* QR Button */}
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => navigation.navigate("ScannerQR", { 
            delivery,
            beneficiaryName: delivery.beneficiary?.name 
          })}
          activeOpacity={0.8}
        >
          <View style={styles.qrButtonIcon}>
            <Ionicons name="qr-code" size={28} color="#fff" />
          </View>
          <View style={styles.qrButtonTextContainer}>
            <Text style={styles.qrButtonText}>Escanear código QR</Text>
            <Text style={styles.qrButtonSubtext}>
              Registrar entrega a {delivery.beneficiary?.name || "el beneficiario"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
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
    paddingVertical: 18,
    backgroundColor: "#E53E3E",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    shadowColor: "#E53E3E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoHeaderText: {
    flex: 1,
  },
  communityName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  municipio: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  // Estilos para la sección del beneficiario
  beneficiarySection: {
    marginBottom: 16,
  },
  beneficiaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  beneficiaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  beneficiaryInfo: {
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  beneficiaryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  beneficiaryIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  beneficiaryId: {
    fontSize: 12,
    color: "#718096",
    fontFamily: "monospace",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  statusContainer: {
    alignItems: "flex-start",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Tarjeta de estadísticas
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  productsSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  categoryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  categoryHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  categoryBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
  },
  categoryContent: {
    backgroundColor: "#F9FAFB",
    paddingTop: 8,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  productRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 16,
  },
  productCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  productQuantityBadge: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  productQuantity: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 40,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  qrButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  qrButtonTextContainer: {
    flex: 1,
  },
  qrButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  qrButtonSubtext: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
    fontWeight: "500",
  },
});