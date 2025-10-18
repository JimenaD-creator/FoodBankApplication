import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseconfig";

export default function DeliveryAssistanceScreen({ navigation, route }: any) {
  const { deliveryId } = route.params || {};
  const [deliveryData, setDeliveryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deliveryId) {
      console.warn("No se recibió deliveryId");
      setLoading(false);
      return;
    }

    const fetchDelivery = async () => {
      try {
        const docRef = doc(db, "scheduledDeliveries", deliveryId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Datos completos de la entrega:", data);
          setDeliveryData(docSnap.data());
        } else {
          console.warn("No se encontró la entrega.");
        }
      } catch (error) {
        console.error("Error al obtener la entrega:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();
  }, [deliveryId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#E53E3E" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  if (!deliveryData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>No se encontraron datos de la entrega</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Regresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const assistanceData = {
    deliveryDate: (() => {
      try {
        const dateField = deliveryData.deliveryDate;
        if (dateField?.seconds) return new Date(dateField.seconds * 1000).toLocaleDateString('es-MX');
        if (typeof dateField === "string" || dateField instanceof Date) return new Date(dateField).toLocaleDateString('es-MX');
        return "Sin fecha";
      } catch {
        return "Sin fecha";
      }
    })(),

    beneficiaryName: Array.isArray(deliveryData.beneficiaries) 
    ? deliveryData.beneficiaries
        .map((b: any) => b?.name)
        .filter(Boolean)
        .join(", ") || "Sin asignar"
    : "Sin asignar",

    address: deliveryData.municipio ? String(deliveryData.municipio) : "No especificado",
    community: deliveryData.communityName ? String(deliveryData.communityName) : "No especificado",
  };

  // Obtener la lista de staff/voluntarios
  const staffList = Array.isArray(deliveryData.volunteers) 
    ? deliveryData.volunteers.filter((v: any) => v?.name).map((v: any) => v.name)
    : [];

  return (
    <View style={styles.container}>
      {/* Header simple */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBackButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#E53E3E" />
        </TouchableOpacity>
        
        <Image 
          source={require('../../../assets/logo_no_background.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Card de asistencia */}
        <View style={styles.card}>
          <Text style={styles.title}>Asistencia</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Fecha de entrega:</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{assistanceData.deliveryDate}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nombre del beneficiario:</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{assistanceData.beneficiaryName}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Trabajador(es) social:</Text>
            <View style={styles.valueContainer}>
              {staffList.length > 0 ? (
                <View style={styles.staffListContainer}>
                  {staffList.map((staffName, index) => (
                    <View key={index} style={styles.staffItem}>
                      <Ionicons name="person" size={16} color="#4A5568" style={styles.staffIcon} />
                      <Text style={styles.staffName}>{staffName}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.value}>Sin asignar</Text>
              )}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Domicilio:</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{assistanceData.address}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Comunidad:</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{assistanceData.community}</Text>
            </View>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.printButton}
            onPress={() => console.log("Imprimir")}
          >
            <Ionicons name="print-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Imprimir</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => console.log("Compartir")}
          >
            <Ionicons name="share-social-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Compartir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Image 
          source={require('../../../assets/logo_no_background.png')} 
          style={styles.footerLogo}
          resizeMode="contain"
        />
        <View style={styles.socialIcons}>
          <TouchableOpacity>
            <Ionicons name="globe-outline" size={24} color="#4A5568" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="logo-facebook" size={24} color="#4A5568" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="logo-instagram" size={24} color="#4A5568" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 16,
    color: "#E53E3E",
    fontWeight: "600",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#E53E3E",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerBackButton: {
    padding: 5,
  },
  logo: {
    width: 100,
    height: 40,
  },
  placeholder: {
    width: 34,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFF9E6",
    borderRadius: 20,
    padding: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2D3748",
    textAlign: "center",
    marginBottom: 30,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 10,
  },
  valueContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  value: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  // Nuevos estilos para la lista vertical de staff
  staffListContainer: {
    flexDirection: "column",
    gap: 8,
  },
  staffItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  staffIcon: {
    marginRight: 8,
  },
  staffName: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  printButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53E3E",
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
    shadowColor: "#E53E3E",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
    shadowColor: "#2196F3",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerLogo: {
    width: 80,
    height: 35,
  },
  socialIcons: {
    flexDirection: "row",
    gap: 15,
  },
});