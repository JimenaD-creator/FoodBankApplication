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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53E3E" />
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      </View>
    );
  }

  if (!deliveryData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorText}>No se encontraron datos de la entrega</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
            <Text style={styles.backButtonText}>Regresar</Text>
          </TouchableOpacity>
        </View>
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
      {/* Header con gradiente */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBackButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Detalles de Asistencia</Text>
          <Text style={styles.headerSubtitle}>Información de entrega</Text>
        </View>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Card principal con gradiente */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBadge}>
              <Ionicons name="calendar" size={28} color="#fff" />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Asistencia</Text>
              <Text style={styles.cardSubtitle}>Información completa de la entrega</Text>
            </View>
          </View>

          {/* Fecha de entrega */}
          <View style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Fecha de entrega</Text>
              <Text style={styles.infoValue}>{assistanceData.deliveryDate}</Text>
            </View>
          </View>

          {/* Beneficiario */}
          <View style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="person-outline" size={24} color="#10B981" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Beneficiario</Text>
              <Text style={styles.infoValue}>{assistanceData.beneficiaryName}</Text>
            </View>
          </View>

          {/* Trabajadores sociales */}
          <View style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: '#FCE7F3' }]}>
              <Ionicons name="people-outline" size={24} color="#EC4899" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Trabajador(es) social</Text>
              {staffList.length > 0 ? (
                <View style={styles.staffListContainer}>
                  {staffList.map((staffName, index) => (
                    <View key={index} style={styles.staffChip}>
                      <View style={styles.staffChipDot} />
                      <Text style={styles.staffChipText}>{staffName}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.infoValue, { color: '#9CA3AF' }]}>Sin asignar</Text>
              )}
            </View>
          </View>

          {/* Domicilio */}
          <View style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="home-outline" size={24} color="#F59E0B" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Domicilio</Text>
              <Text style={styles.infoValue}>{assistanceData.address}</Text>
            </View>
          </View>

          {/* Comunidad */}
          <View style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="location-outline" size={24} color="#6366F1" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Comunidad</Text>
              <Text style={styles.infoValue}>{assistanceData.community}</Text>
            </View>
          </View>
        </View>

        {/* Botones de acción con gradientes */}
        <View style={styles.actions}>

          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => console.log("Compartir")}
          >
            <View style={styles.buttonIconContainer}>
              <Ionicons name="share-social" size={22} color="#fff" />
            </View>
            <Text style={styles.buttonText}>Compartir</Text>
          </TouchableOpacity>
        </View>

      
      </ScrollView>

      {/* Footer mejorado */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Image 
            source={require('../../../assets/logo_no_background.png')} 
            style={styles.footerLogo}
            resizeMode="contain"
          />
          
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  errorContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  errorText: {
    fontSize: 18,
    color: "#EF4444",
    fontWeight: "700",
    marginVertical: 20,
    textAlign: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E53E3E",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#E53E3E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: "#E53E3E",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#E53E3E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerBackButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  },
  headerContent: {
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
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  mainCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#FEE2E2",
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#E53E3E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E53E3E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeaderText: {
    marginLeft: 16,
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
    lineHeight: 22,
  },
  staffListContainer: {
    marginTop: 8,
    gap: 8,
  },
  staffChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  staffChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EC4899",
    marginRight: 8,
  },
  staffChipText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  printButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53E3E",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#E53E3E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 20,
    fontWeight: "500",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  footerLogo: {
    width: 90,
    height: 40,
  },
  socialIcons: {
    flexDirection: "row",
    gap: 10,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});