import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ImageBackground } from 'react-native';
import { useState } from 'react';
import { auth, db } from './firebaseconfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { hasAcceptedPrivacyPolicy } from '../services/privacyService';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa correo y contraseña");
      return;
    }

    try {
      // Autenticar usuario
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Obtener datos del usuario
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        Alert.alert("Error", "Datos de usuario no encontrados");
        return;
      }

      const userData = userDoc.data();
      const userRole = userData.role;

      switch (userRole) {
        case 'admin':
          navigation.replace("AdminDashboard");
          break;

        case 'staff':
          navigation.replace("StaffDashboard");
          break;

        case 'beneficiary':
          // Revisar si aceptó la política de privacidad usando UID
          const accepted = await hasAcceptedPrivacyPolicy(user.uid);
          if (accepted) {
            navigation.replace("BeneficiaryDashboard");
          } else {
            navigation.replace("PrivacyPolicyScreen", {
              uid: user.uid, // pasamos UID
              onAccept: () => navigation.replace("BeneficiaryDashboard")
            });
          }
          break;

        default:
          Alert.alert("Error", "Rol de usuario no reconocido");
      }

    } catch (error: any) {
      Alert.alert("Error: ", error.message);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/logo_no_background.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Formulario */}
      <View style={styles.formContainer}>
        <View style={styles.pinkContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Correo</Text>
            <TextInput
              style={styles.input}
              placeholder=" "
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder=" "
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Text style={styles.signUp}>
              ¿No tienes cuenta? <Text style={styles.signUpLink}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(255, 255, 255, 0.5)', 
  },
  logoContainer: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  logo: {
    width: 300,
    height: 160,
  },
  formContainer: {
    flex: 0.7,
    width: '100%',
    paddingHorizontal: 30,
    justifyContent: 'flex-start',
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
    fontWeight: '500',
  },
  input: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#2D3748",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  button: {
    height: 50,
    backgroundColor: "#E53E3E",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: '600',
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
    fontWeight: '600',
  },
});
