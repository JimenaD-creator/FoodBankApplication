import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { collection, getDocs } from "firebase/firestore";
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

      const deliveriesSnapshot = await getDocs(collection(db, "scheduledDeliveries"));
      
      console.log("📊 Total de entregas encontradas:", deliveriesSnapshot.size);

      let beneficiaryData = null;
      let deliveryData = null;

      // Debug: mostrar todas las entregas y sus beneficiarios
      deliveriesSnapshot.forEach((doc) => {
        const delivery = doc.data();
        console.log(`📦 Entrega: ${delivery.communityName} (${doc.id})`);
        
        if (delivery.beneficiaries && Array.isArray(delivery.beneficiaries)) {
          console.log(`   👥 Beneficiarios: ${delivery.beneficiaries.length}`);
          delivery.beneficiaries.forEach((b: any) => {
            console.log(`   - ${b.id} : ${b.name}`);
          });
          
          const beneficiary = delivery.beneficiaries.find(
            (b: any) => b.id === currentUser.uid
          );
          
          if (beneficiary) {
            console.log("ENCONTRADO EN ESTA ENTREGA!");
            beneficiaryData = beneficiary;
            deliveryData = {
              id: doc.id,
              communityName: delivery.communityName,
              municipio: delivery.municipio,
              deliveryDate: delivery.deliveryDate,
              status: delivery.status
            };
          }
        }
      });

      if (beneficiaryData && deliveryData) {
        setQrData({
          deliveryId: deliveryData.id,
          beneficiaryId: beneficiaryData.id,
          qrCode: beneficiaryData.qrCode,
          beneficiaryName: beneficiaryData.name,
          communityName: deliveryData.communityName,
          municipio: deliveryData.municipio,
          deliveryDate: deliveryData.deliveryDate,
          status: deliveryData.status,
          redeemed: beneficiaryData.redeemed || false
        });
        console.log("🎉 QR cargado correctamente para:", beneficiaryData.name);
      } else {
        console.log("❌ Usuario no encontrado en ninguna entrega");
        console.log("ID buscado:", currentUser.uid);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Buscando tu código QR...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
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
        <Text style={styles.errorText}>No se pudo generar el código QR</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRetry}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Código QR</Text>
      <Text style={styles.subtitle}>
        Muestra este código al voluntario para recibir tu despensa
      </Text>

      {/* Código QR */}
      <View style={styles.qrContainer}>
        <QRCode
          value={JSON.stringify({
            deliveryId: qrData.deliveryId,
            beneficiaryId: qrData.beneficiaryId,
            qrCode: qrData.qrCode,
            timestamp: new Date().toISOString()
          })}
          size={250}
          backgroundColor="#fff"
          color="#4CAF50"
        />
      </View>

      {/* Instrucciones */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>Instrucciones:</Text>
        <View style={styles.instructionItem}>
          <Ionicons name="phone-portrait-outline" size={16} color="#4CAF50" />
          <Text style={styles.instructionText}>Mantén este código a la mano</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="person-outline" size={16} color="#4CAF50" />
          <Text style={styles.instructionText}>Muéstralo al voluntario al recibir tu despensa</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="lock-closed-outline" size={16} color="#4CAF50" />
          <Text style={styles.instructionText}>No compartas este código con otras personas</Text>
        </View>
      </View>

      {/* Botón de actualizar */}
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={handleRetry}
      >
        <Ionicons name="refresh" size={20} color="#4CAF50" />
        <Text style={styles.refreshButtonText}>Actualizar estado</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F7FAFC", 
    padding: 20 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#718096"
  },
  header: { 
    fontSize: 26, 
    fontWeight: "bold", 
    marginBottom: 12, 
    textAlign: "center",
    color: "#2D3748"
  },
  subtitle: { 
    fontSize: 16, 
    color: "#718096", 
    textAlign: "center", 
    marginBottom: 30,
    lineHeight: 22
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 25,
    alignItems: "center",
    width: "100%",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  communityName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4,
    textAlign: "center"
  },
  municipio: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 8
  },
  deliveryDate: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    textTransform: "capitalize",
    marginBottom: 8
  },
  beneficiaryName: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
    textAlign: "center"
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
    gap: 8
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff"
  },
  codeContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center"
  },
  codeLabel: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 4
  },
  codeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3748",
    fontFamily: "monospace"
  },
  instructionsCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20
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
  }
});