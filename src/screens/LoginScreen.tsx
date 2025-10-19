"use client"

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ImageBackground,
  ActivityIndicator,
} from "react-native"
import { useState } from "react"
import { auth, db } from "./firebaseconfig"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { Ionicons } from "@expo/vector-icons"
import { hasAcceptedPrivacyPolicy } from "../services/privacyService"
import { useUserRole } from "../hooks/UserContext"

// Servicio de tokens seguro
import { TokenService } from "../services/secureTokenService"

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setRole } = useUserRole()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa correo y contraseña")
      return
    }

    setLoading(true)

    try {
      // 1. Hacer login
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // 2. Obtener datos del usuario
      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (!userDoc.exists()) {
        Alert.alert("Error", "Datos de usuario no encontrados")
        setLoading(false)
        return
      }

      const userData = userDoc.data()

      // 3. Guardar tokens de forma segura (sin mostrar modal)
      const firebaseToken = await user.getIdToken()
      await TokenService.saveTokens(firebaseToken, `refresh_token_${user.uid}`)

      console.log("✅ Login exitoso - Usuario:", user.email, "Rol:", userData.role)
      setRole(userData.role)

      // 4. Redirigir directamente según el rol
      switch (userData.role) {
        case "admin":
          navigation.replace("Main")
          break
        case "staff":
          navigation.replace("Main")
          break
        case "beneficiary":
          const accepted = await hasAcceptedPrivacyPolicy(user.uid)
          if (accepted) {
            // 🔹 Navigate to Main (with navbar visible)
            navigation.replace("Main")
          } else {
            navigation.replace("PrivacyPolicyScreen", {
              uid: user.uid,
              onAccept: () => navigation.replace("Main"),
            })
          }
          break
        default:
          Alert.alert("Error", "Rol de usuario no reconocido: " + userData.role)
          setLoading(false)
          return
      }
    } catch (error: any) {
      console.error("❌ Error en login:", error)
      let errorMessage = "Error al iniciar sesión"

      if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido"
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "Usuario no encontrado"
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Contraseña incorrecta"
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Error de conexión"
      }

      Alert.alert("Error", errorMessage)
      setLoading(false)
    }
  }

  return (
    <ImageBackground source={require("../../assets/background.jpg")} style={styles.container} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.logoContainer}>
        <Image source={require("../../assets/logo_no_background.png")} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.pinkContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Correo</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#718096" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder=" "
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#718096" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder=" "
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#718096" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Iniciar Sesión</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} disabled={loading}>
            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("UserTypeScreen")} disabled={loading}>
            <Text style={styles.signUp}>
              ¿No tienes cuenta? <Text style={styles.signUpLink}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  logoContainer: {
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  logo: {
    width: 300,
    height: 160,
  },
  formContainer: {
    flex: 0.7,
    width: "100%",
    paddingHorizontal: 30,
    justifyContent: "flex-start",
  },
  pinkContainer: {
    backgroundColor: "#FED7E2",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: "#2D3748",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#2D3748",
  },
  button: {
    height: 50,
    backgroundColor: "#E53E3E",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonDisabled: {
    backgroundColor: "#C53030",
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  forgotPassword: {
    textAlign: "center",
    color: "#E53E3E",
    fontSize: 14,
    marginVertical: 10,
  },
  signUp: {
    textAlign: "center",
    color: "#2D3748",
    fontSize: 14,
    marginTop: 10,
  },
  signUpLink: {
    color: "#E53E3E",
    fontWeight: "600",
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    height: 50,
  },
})
