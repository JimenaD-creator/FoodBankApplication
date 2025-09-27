import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ImageBackground, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { auth, db } from "./firebaseconfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";

export default function RegisterScreen({ route, navigation }: any) {
  const { userType, isFromAdminDashboard } = route.params || {}; 
  // userType: "admin" | "staff" | "beneficiary"

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Campos extra
  const [phone, setPhone] = useState("");
  const [community, setCommunity] = useState("");
  const [familySize, setFamilySize] = useState("");

  // Estados para manejo de admins
  const [isFirstAdmin, setIsFirstAdmin] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const getThemeColors = () => {
    switch (userType) {
      case 'admin':
        return {
          containerBg: 'rgba(255, 204, 204, 0.95)', // Rosa claro para admin
          buttonBg: '#E53E3E',                       // Rojo para admin
          buttonText: 'Soy administrador',
          linkColor: '#E53E3E'
        };
      case 'staff':
        return {
          containerBg: 'rgba(255, 235, 153, 0.95)', // Amarillo claro para staff
          buttonBg: '#F59E0B',                       // Naranja para staff
          buttonText: 'Soy voluntario',
          linkColor: '#F59E0B'
        };
      case 'beneficiary':
      default:
        return {
          containerBg: 'rgba(196, 226, 196, 0.95)', // Verde claro para beneficiario
          buttonBg: '#4CAF50',                       // Verde para beneficiario
          buttonText: 'Soy beneficiario',
          linkColor: '#4CAF50'
        };
    }
  };

  const themeColors = getThemeColors();

  // Verificar si ya existe algún admin
  useEffect(() => {
    const checkAdmins = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const admins = snapshot.docs.filter((doc) => doc.data().role === "admin");
        setIsFirstAdmin(admins.length === 0);
      } catch (error) {
        console.error("Error al verificar admins:", error);
      } finally {
        setLoadingAdmins(false);
      }
    };

    if (userType === "admin") {
      checkAdmins();
    } else {
      setLoadingAdmins(false);
    }
  }, [userType]);

  // Bloquear si alguien quiere registrarse como admin directo y ya existe un SuperAdmin
  useEffect(() => {
    if (!loadingAdmins) {
      if (userType === "admin" && !isFirstAdmin && !isFromAdminDashboard) {
        Alert.alert(
          "Error",
          "Solo un administrador existente puede registrar nuevos admins.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    }
  }, [userType, isFirstAdmin, isFromAdminDashboard, navigation, loadingAdmins]);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Todos los campos básicos son obligatorios");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        await updateProfile(user, { displayName: fullName });

        // Datos comunes
        let userData: any = {
          fullName,
          email,
          role: userType,
          phone,
          createdAt: new Date(),
          status: "Pendiente", // por default hasta que admin apruebe
        };

        // Ajustar rol admin
        if (userType === "admin") {
          if (isFirstAdmin) {
            userData = { ...userData, adminType: "SuperAdmin" };
          } else if (isFromAdminDashboard) {
            userData = { ...userData, adminType: "AdminOperativo" };
          }
        }

        // Ajustar según el rol
        if (userType === "staff") {
          userData = {
            ...userData,
            community,
          };
        } else if (userType === "beneficiary") {
          userData = {
            ...userData,
            community,
            familySize,
          };
        }

        // Guardar en Firestore
        await setDoc(doc(db, "users", user.uid), userData);
      }

      Alert.alert("Éxito", "Usuario registrado correctamente");
      navigation.navigate("Login");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  if (loadingAdmins) {
    return (
      <ImageBackground 
        source={require('../../assets/background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground 
      source={require('../../assets/background.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Logo Container */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/splash_1.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <View style={[styles.containerBox, { backgroundColor: themeColors.containerBg }]}>
              {/* Botón indicador de tipo de usuario */}
              <TouchableOpacity style={[styles.userTypeButton, { backgroundColor: themeColors.buttonBg }]}>
                <Text style={styles.userTypeButtonText}>
                  {userType === "admin"
                    ? "Soy administrador"
                    : userType === "staff"
                    ? "Soy trabajador"
                    : userType === "beneficiary"
                    ? "Soy beneficiario"
                    : "Soy usuario"}
                </Text>
              </TouchableOpacity>

              {/* Campos básicos */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nombre completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder=""
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Correo electrónico</Text>
                <TextInput
                  style={styles.input}
                  placeholder=""
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  placeholder=""
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder=""
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirmar contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder=""
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {/* Campos adicionales según rol */}
              {(userType === "staff" || userType === "beneficiary") && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Comunidad</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={community}
                    onChangeText={setCommunity}
                  />
                </View>
              )}

              {userType === "beneficiary" && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Tamaño de familia</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    keyboardType="numeric"
                    value={familySize}
                    onChangeText={setFamilySize}
                  />
                </View>
              )}

              <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.buttonBg }]} onPress={handleRegister}>
                <Text style={styles.buttonText}>Registrarse</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  logoContainer: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 80,
  },
  loadingText: {
    fontSize: 18,
    color: '#2D3748',
    textAlign: 'center',
    marginTop: 50,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greenContainer: {
    backgroundColor: "rgba(196, 226, 196, 0.95)", 
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  containerBox: {
    // Nuevo estilo para el contenedor con colores dinámicos
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 5,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    maxWidth: '100%',
  },
  userTypeButton: {
    backgroundColor: "#4CAF50", // Verde más oscuro
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  userTypeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3748",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: "#2D3748",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    height: 45,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#2D3748",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  button: {
    height: 50,
    backgroundColor: "#4CAF50", 
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  signUp: {
    textAlign: "center",
    color: "#2D3748",
    fontSize: 14,
  },
  signUpLink: {
    color: "#4CAF50",
    fontWeight: "600",
  },
});