import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, ImageBackground } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db, auth } from "../firebaseconfig";
import { Ionicons } from "@expo/vector-icons";

export default function BeneficiaryQR({ navigation }: any) {
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBeneficiaryQR();
  }, []);

  const fetchBeneficiaryQR = async () => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      setError("Usuario no autenticado");
      setLoading(false);
      return;
    }

    console.log("🔍 Buscando entregas para:", currentUser.uid);

    // Buscar específicamente entregas del beneficiario actual
    const deliveriesQuery = query(
      collection(db, "scheduledDeliveries"),
      where("beneficiary.id", "==", currentUser.uid)
    );

    const deliveriesSnapshot = await getDocs(deliveriesQuery);
    
    console.log("📊 Total de entregas encontradas para este beneficiario:", deliveriesSnapshot.size);

    let upcomingDelivery = null;
    const now = new Date();

    // Buscar la entrega MÁS PRÓXIMA (no entregada y con fecha futura o de hoy)
    deliveriesSnapshot.forEach((doc) => {
      const delivery = doc.data();
      const deliveryDate = delivery.deliveryDate.toDate();
      
      console.log(`📦 Entrega: ${delivery.communityName} - ${deliveryDate}`);
      console.log(`   Estado: ${delivery.status}`);
      console.log(`   QR: ${delivery.beneficiary?.qrCode}`);

      // Solo considerar entregas no entregadas y con fecha futura/hoy
      if (delivery.status !== "entregada" && deliveryDate >= now) {
        if (!upcomingDelivery || deliveryDate < upcomingDelivery.deliveryDate.toDate()) {
          console.log("✅ ENCONTRADA ENTREGA PRÓXIMA");
          upcomingDelivery = {
            ...delivery,
            id: doc.id
          };
        }
      }
    });

    // Si no hay entregas próximas, usar la más reciente no entregada
    if (!upcomingDelivery) {
      console.log("⚠️  No hay entregas próximas, buscando la más reciente no entregada");
      deliveriesSnapshot.forEach((doc) => {
        const delivery = doc.data();
        if (delivery.status !== "entregada") {
          if (!upcomingDelivery || delivery.deliveryDate.toDate() > upcomingDelivery.deliveryDate.toDate()) {
            upcomingDelivery = {
              ...delivery,
              id: doc.id
            };
          }
        }
      });
    }

    if (upcomingDelivery) {
      const qrValue = upcomingDelivery.beneficiary?.qrCode || upcomingDelivery.deliveryId || upcomingDelivery.id;
      
      console.log("🎯 ENTREGA SELECCIONADA:", upcomingDelivery.communityName);
      console.log("📅 FECHA:", upcomingDelivery.deliveryDate);
      console.log("🎯 VALOR FINAL DEL QR:", qrValue);

      setQrData({
        deliveryId: qrValue,
        beneficiaryName: upcomingDelivery.beneficiary?.name,
        communityName: upcomingDelivery.communityName,
        municipio: upcomingDelivery.municipio,
        deliveryDate: upcomingDelivery.deliveryDate,
        status: upcomingDelivery.status
      });
      
      console.log("🎉 QR cargado correctamente");
    } else {
      console.log("❌ No se encontraron entregas próximas para el usuario");
      setError(`No tienes entregas programadas en este momento.

Si acabas de ser agregado a una entrega, espera unos minutos o contacta al administrador.`);
    }

  } catch (error) {
    console.error("Error fetching QR:", error);
    setError("Error al cargar el código QR. Intenta más tarde.");
  } finally {
    setLoading(false);
  }
};

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setQrData(null);
    setTimeout(() => {
      fetchBeneficiaryQR();
    }, 1000);
  };

  // Función para determinar el tipo de código mostrado
  const getCodeType = () => {
    if (!qrData) return "";
    
    switch (qrData.qrSource) {
      case "beneficiary":
        return "Código QR personal";
      case "delivery":
        return "ID de entrega";
      case "document":
        return "ID del documento";
      default:
        return "Código de verificación";
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {/* Header para loading */}
        <ImageBackground 
          source={require('../../../assets/background.jpg')}
          style={styles.headerBackground}
          resizeMode="cover"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#E53E3E" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mi Código QR</Text>
            <View style={{ width: 24 }} />
          </View>
        </ImageBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Buscando tu código QR...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {/* Header para error */}
        <ImageBackground 
          source={require('../../../assets/background.jpg')}
          style={styles.headerBackground}
          resizeMode="cover"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#E53E3E" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mi Código QR</Text>
            <View style={{ width: 24 }} />
          </View>
        </ImageBackground>
        <View style={styles.errorCard}>
          <Ionicons name="qr-code-outline" size={64} color="#CBD5E0" />
          <Text style={styles.errorTitle}>Sin entregas programadas</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!qrData) {
    return (
      <View style={styles.container}>
        {/* Header para error sin QR */}
        <ImageBackground 
          source={require('../../../assets/background.jpg')}
          style={styles.headerBackground}
          resizeMode="cover"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#E53E3E" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mi Código QR</Text>
            <View style={{ width: 24 }} />
          </View>
        </ImageBackground>
        <View style={styles.content}>
          <Text style={styles.errorText}>No se pudo generar el código QR</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Código QR</Text>
          <View style={{ width: 24 }} />
        </View>
      </ImageBackground>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.subtitle}>
            Muestra este código al voluntario para recibir tu despensa
          </Text>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <View style={styles.qrContainer}>
            <QRCode
              value={qrData.deliveryId}
              size={280}
              backgroundColor="#fff"
              color="#4CAF50"
            />
          </View>
          
          {/* Información del código 
          <View style={styles.codeContainer}>
            <Text style={styles.codeType}>{getCodeType()}</Text>
            <Text style={styles.codeValue}>{qrData.deliveryId}</Text>
          </View>*/}
        </View>

        {/* Instructions Section */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Instrucciones</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionIcon}>
                <Ionicons name="phone-portrait-outline" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.instructionText}>Mantén este código a la mano</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionIcon}>
                <Ionicons name="person-outline" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.instructionText}>Muéstralo al voluntario al recibir tu despensa</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionIcon}>
                <Ionicons name="lock-closed-outline" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.instructionText}>No compartas este código con otras personas</Text>
            </View>
          </View>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRetry}
        >
          <Ionicons name="refresh" size={20} color="#4CAF50" />
          <Text style={styles.refreshButtonText}>Actualizar estado</Text>
        </TouchableOpacity>
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
    paddingTop: 50,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 70,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#718096"
  },
  headerSection: {
    marginBottom: 24,
    alignItems: "center",
  },
  subtitle: { 
    fontSize: 16, 
    color: "#718096", 
    textAlign: "center", 
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  communityName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
  },
  municipio: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 12,
  },
  beneficiaryName: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  qrSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  instructionsList: {
    gap: 16,
  },

  qrContainer: { 
    backgroundColor: "#fff", 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    alignSelf: "center"
  },
  codeContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
    marginTop: 0,
  },
  codeType: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 4,
    fontWeight: "500",
  },
  codeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
    fontFamily: "monospace",
  },
  instructionsCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 0,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 12
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10
  },
  instructionText: {
    fontSize: 14,
    color: "#4A5568",
    flex: 1
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
    gap: 8
  },
  refreshButtonText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500"
  },
  errorCard: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginTop: 60
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 12,
    marginTop: 16,
    textAlign: "center"
  },
  errorMessage: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16
  },
  errorText: {
    fontSize: 16,
    color: "#E53E3E",
    textAlign: "center",
    marginBottom: 20
  },
   instructionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
});