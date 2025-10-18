
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ImageBackground, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseconfig";

const PRODUCT_CATEGORIES = [
  { id: "canasta_basica", name: "Canasta básica", color: "#FFE8CC" },
  { id: "fruta_verdura", name: "Fruta y verdura", color: "#FFE8CC" },
  { id: "carne_lacteos", name: "Carne, embutido, lácteos", color: "#FFEBEE" },
  { id: "abarrotes", name: "Abarrotes", color: "#FFF9C4" },
  { id: "no_alimenticios", name: "No alimenticios", color: "#E3F2FD" }
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
}

interface Props {
  route: { params: { delivery: Delivery } };
  navigation: any;
}

export default function StaffDelivery({ route, navigation }: any) {
  const { delivery } = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const templateDoc = await getDoc(doc(db, "deliveries", "standardTemplate"));
        if (!templateDoc.exists()) return;

        const templateData = templateDoc.data().products || {};
        const productArray: Product[] = Object.entries(templateData).map(([id, p]: any) => ({
          id,
          name: p.name,
          category: p.category,
          unit: p.unit,
          quantity: delivery.products[id]?.quantity || 0 // cantidad de esta entrega
        }));

        setProducts(productArray);
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar la despensa.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [delivery.products]);

  const groupedProducts = PRODUCT_CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = products.filter((p) => p.category === cat.id);
    return acc;
  }, {} as Record<string, Product[]>);

  const formatDate = (timestamp: any) => timestamp.toDate().toLocaleDateString("es-MX");
  const formatTime = (timestamp: any) => timestamp.toDate().toLocaleTimeString("es-MX");

  if (loading) return <Text style={{ marginTop: 50, textAlign: "center" }}>Cargando despensa...</Text>;

  return (
    <ScrollView style={{ padding: 0 }}>
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
                <Text style={styles.title}>Entrega Programada</Text>
              </View>
            </ImageBackground>
      <Text style= {styles.subtitle}>Comunidad: {delivery.communityName}, {delivery.municipio}</Text>
      <Text style= {styles.subtitle}>Fecha: {formatDate(delivery.deliveryDate)}</Text>
      <Text style= {styles.subtitle}>Hora: {formatTime(delivery.deliveryDate)}</Text>
      <Text style= {styles.subtitle}>Estatus: {delivery.status}</Text>

      {PRODUCT_CATEGORIES.map((cat) => {
        const catProducts = groupedProducts[cat.id] || [];
        return (
          <View key={cat.id} style={{ marginTop: 20, marginHorizontal: 5 }}>

            <View style={{ backgroundColor: cat.color, padding: 10, borderRadius: 10, flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "bold" }}>{cat.name}</Text>
              <Text>{catProducts.length}</Text>
            </View>

            {catProducts.length === 0 ? (
              <Text style={{ marginLeft: 10, marginTop: 5, color: "#A0AEC0" }}>No hay productos en esta categoría</Text>
            ) : (
              catProducts.map((p) => (
                <View key={p.id} style={styles.productRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text>{p.name} - {p.quantity} {p.unit}</Text>
                </View>
              ))
            )}
            
          </View>
        );
      })}
      <TouchableOpacity
        style={styles.qrButton}
        onPress={() => navigation.navigate("ScannerQR", { delivery })}
        >
        <Text style={styles.qrButtonText}>Escanear QR</Text>
    </TouchableOpacity>
    </ScrollView>
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
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E53E3E",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  subtitle : {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E53E3E",
    flex: 1,
    textAlign: "left",
    marginHorizontal: 10,
  },
  headerActions: {
    flexDirection: "row",
  },
  headerActionButton: {
    padding: 5,
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  productRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 5 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  infoText: { fontSize: 16, color: "#2D3748" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#2D3748", marginBottom: 12 },
  productsContainer: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 20 },
  productItem: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  productText: { fontSize: 16, color: "#2D3748" },
  qrButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 25,
  },
  qrButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});