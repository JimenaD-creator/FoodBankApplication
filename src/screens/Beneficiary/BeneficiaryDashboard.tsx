import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function BeneficiaryDashboard({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenido</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.welcomeText}>¡Hola Beneficiario!</Text>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Ver Mis Despensas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Mi Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Comunidades</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#1E90FF",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  button: {
    backgroundColor: "#1E90FF",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});