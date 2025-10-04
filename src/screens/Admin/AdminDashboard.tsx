import React from "react";
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ImageBackground } from "react-native";
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
          <View style={styles.headerLeft}>
            <Image 
              source={require('../../../assets/logo_no_background.png')} 
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Dashboard</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <View style={styles.notificationBadge}>
                <Ionicons name="notifications" size={24} color="#E53E3E" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => navigation.navigate("ProfileScreen")}
            >
              <Image
                source={require("../../../assets/usuario.png")} 
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contenido principal */}
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>📊 Métricas principales</Text>

          <View style={styles.grid}>
            <TouchableOpacity
              style={[styles.card, styles.beneficiariesCard]}
              onPress={() => navigation.navigate("BeneficiariesList")}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="people" size={32} color="#4CAF50" />
              </View>
              <Text style={styles.cardValue}>{beneficiariesCount}</Text>
              <Text style={styles.cardLabel}>Beneficiarios</Text>
            </TouchableOpacity>

            <View style={[styles.card, styles.deliveriesCard]}>
              <View style={styles.cardIcon}>
                <Ionicons name="cube" size={32} color="#2196F3" />
              </View>
              <Text style={styles.cardValue}>{deliveriesCount}</Text>
              <Text style={styles.cardLabel}>Despensas</Text>
            </View>

            <View style={[styles.card, styles.staffCard]}>
              <View style={styles.cardIcon}>
                <Ionicons name="person" size={32} color="#FF9800" />
              </View>
              <Text style={styles.cardValue}>{volunteersCount}</Text>
              <Text style={styles.cardLabel}>Staff activo</Text>
            </View>

           <TouchableOpacity
           style={[styles.card, styles.communitiesCard]}
              onPress={() => navigation.navigate("CommunitiesManagement")}
           >
              <View style={styles.cardIcon}>
                <Ionicons name="location" size={32} color="#E53E3E" />
              </View>
              <Text style={styles.cardValue}>{communitiesCount}</Text>
              <Text style={styles.cardLabel}>Comunidades</Text>
            
            </TouchableOpacity>
          </View>
          
          {/* Acciones rápidas */}
          <Text style={styles.sectionTitle}>⚡ Acciones rápidas</Text>

          <View style={styles.quickActionContainer}>

        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: '#2196F3' }]}
          onPress={() => navigation.navigate("StandardTemplate")}
        >
          
          <Ionicons name="cube" size={28} color="#fff" />
          <Text style={styles.quickActionText}>Gestionar Despensa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: '#FF9800' }]}
          onPress={() => navigation.navigate("DeliveryManagement")}
        >
            <Ionicons name="calendar" size={28} color="#fff" />
          <Text style={styles.quickActionText}>Programar Entregas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: '#E53E3E' }]}
          onPress={() => navigation.navigate("Registrar", { userType: "admin", isFromAdminDashboard: true })}
        >
            <Ionicons name="person-add" size={28} color="#fff" />
          <Text style={styles.quickActionText}>Registrar</Text>
        </TouchableOpacity>
      </View>         
    </ScrollView>
  </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: "#D3D3D3",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerLogo: {
    width: 60,
    height: 50,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginRight: 15,
    padding: 8,
  },
  notificationBadge: {
    backgroundColor: "rgba(229, 62, 62, 0.1)",
    borderRadius: 20,
    padding: 8,
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: "#E53E3E",
    borderRadius: 20,
    padding: 2,
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
    marginTop: 10,
    color: "#2D3748",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  card: {
    width: "48%",
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  beneficiariesCard: {
    backgroundColor: "rgba(196, 226, 196, 0.95)",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  deliveriesCard: {
    backgroundColor: "rgba(187, 222, 251, 0.95)",
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  staffCard: {
    backgroundColor: "rgba(255, 235, 153, 0.95)",
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  communitiesCard: {
    backgroundColor: "rgba(255, 204, 204, 0.95)",
    borderLeftWidth: 4,
    borderLeftColor: "#E53E3E",
  },
  cardIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#2D3748",
  },
  cardLabel: {
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "500",
  },
  updatesContainer: {
    marginBottom: 25,
  },
  updateCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  successUpdate: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  infoUpdate: {
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  updateIcon: {
    marginRight: 12,
    justifyContent: "center",
  },
  updateContent: {
    flex: 1,
  },
  updateText: {
    fontSize: 14,
    color: "#2D3748",
    fontWeight: "500",
  },
  updateTime: {
    fontSize: 12,
    color: "#718096",
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginLeft: 50,
    borderRadius: 25,
    width: "68%",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  adminRegisterButton: {
    backgroundColor: "#E53E3E",
  },
  staffRegisterButton: {
    backgroundColor: "#FF9800",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  quickActionContainer: {
    gap: 12,
    marginBottom: 20,

  },
  quickActionButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderRadius: 12,
  gap: 10,
},
quickActionText: {
  color: "#ffffff",
  fontSize: 15,
  fontWeight: "600",
},
quickActionTitle: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#2D3748",
  marginBottom: 4,
},
quickActionSubtitle: {
  fontSize: 12,
  color: "#718096",
  textAlign: "center",
},
});