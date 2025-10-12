"use client"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"

interface LandingPageProps {
  navigation: any
}

export default function LandingPage({ navigation }: LandingPageProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={require("../../assets/logo_no_background.png")} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>Banco de Alimentos</Text>
        <Text style={styles.subtitle}>Sistema de Gestión de Despensas</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation?.navigate("LoginScreen")}>
            <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation?.navigate("RegisterScreen")}>
            <Text style={styles.secondaryButtonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation?.navigate("PrivacyPolicyScreen")}>
          <Text style={styles.privacyLink}>Política de Privacidad</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 50,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
  },
  primaryButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  secondaryButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
  },
  privacyLink: {
    marginTop: 30,
    color: "#2196F3",
    fontSize: 14,
    textDecorationLine: "underline",
  },
})
