import React from "react";
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AdminDashboard({ navigation }: any) {
  const [deliveriesCount, setDeliveriesCount] = useState(0);
  const [beneficiariesCount, setBeneficiariesCount] = useState(0);
  const [volunteersCount, setVolunteersCount] = useState(0);
  const [communitiesCount, setCommunitiesCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveriesCount ((prev) => prev + 1);
      setBeneficiariesCount((prev) => prev+2);
      setVolunteersCount((prev) => prev+1);
      setCommunitiesCount(5);
    }, 2000)

    return() => clearInterval(interval);
    
  }, [])
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
            <Image
              source={require("../../../assets/usuario.png")} 
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido principal */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Métricas principales</Text>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("BeneficiariesList")}
          >
            <Ionicons name="people-outline" size={28} color="#4CAF50" />
            <Text style={styles.cardValue}>{beneficiariesCount}</Text>
            <Text style={styles.cardLabel}>Beneficiarios</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Ionicons name="cube-outline" size={28} color="#2196F3" />
            <Text style={styles.cardValue}>{deliveriesCount}</Text>
            <Text style={styles.cardLabel}>Despensas</Text>
          </View>

          <View style={styles.card}>
            <Ionicons name="person-outline" size={28} color="#FF9800" />
            <Text style={styles.cardValue}>{volunteersCount}</Text>
            <Text style={styles.cardLabel}>Staff activo</Text>
          </View>

          <View style={styles.card}>
            <Ionicons name="location-outline" size={28} color="#FF9800" />
            <Text style={styles.cardValue}>{communitiesCount}</Text>
            <Text style={styles.cardLabel}>Comunidades</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Últimas actualizaciones</Text>
        <View style={styles.updateCard}>
          <Text style={styles.updateText}>✔️ Se entregaron 30 despensas en Zapopan</Text>
          <Text style={styles.updateTime}>Hace 2 horas</Text>
        </View>
        <View style={styles.updateCard}>
          <Text style={styles.updateText}>📌 Nueva comunidad programada: Tonalá</Text>
          <Text style={styles.updateTime}>Hace 5 horas</Text>
        </View>
        <TouchableOpacity
          style={styles.adminRegisterButton}
          onPress={() => navigation.navigate("Registrar", { defaultRole: "admin", isFromAdminDashboard: true })}
        >
        <Text style={styles.adminRegisterButtonText}>Registrar Administrador</Text>
</TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "black",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginRight: 15,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  cardLabel: {
    fontSize: 14,
    color: "#666",
  },
  updateCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  updateText: {
    fontSize: 14,
    color: "#333",
  },
  updateTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  adminRegisterButton: {
  backgroundColor: "#1E90FF", // azul brillante
  paddingVertical: 15,
  paddingHorizontal: 20,
  borderRadius: 8,
  alignItems: "center",
  marginVertical: 15,
},

adminRegisterButtonText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
},
  
});


