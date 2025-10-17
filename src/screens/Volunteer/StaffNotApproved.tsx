"use client"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"


export default function StaffNotApproved({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={require("../../../assets/logo_no_background.png")} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>Pendiente de Validación</Text>
        <Text style={styles.subtitle}>Su perfil de Voluntario todavia no ha sido validado por algun Administrador vuelva a intentarlo mas tarde</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation?.navigate("Login")}>
            <Text style={styles.primaryButtonText}>Volver a Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
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
