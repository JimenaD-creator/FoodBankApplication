import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function DeliveryQR({ route }: any) {
  const { delivery } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Código QR de la entrega</Text>
      <Text style={styles.subtitle}>
        Muestra este código al voluntario para recibir tu despensa
      </Text>

      <View style={styles.qrContainer}>
        <QRCode
          value={delivery.id}
          size={220}
          backgroundColor="#fff"
          color="#4CAF50"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7FAFC", padding: 20 },
  header: { fontSize: 22, fontWeight: "600", marginBottom: 12, textAlign: "center" },
  subtitle: { fontSize: 15, color: "#718096", textAlign: "center", marginBottom: 30 },
  qrContainer: { backgroundColor: "#fff", padding: 20, borderRadius: 20, elevation: 2, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
});
