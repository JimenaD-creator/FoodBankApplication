import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
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
      <View style={styles.container}>
        <Text style={styles.title}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {userType === "admin"
        ? "Registro Administrador"
        : userType === "staff"
        ? "Registro Staff"
        : userType === "beneficiary"
        ? "Registro Beneficiario"
        : "Registro Usuario"
         }
      </Text>

      {/* Campos básicos */}
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      


      {/* Campos adicionales según rol */}
      {(userType === "staff" || userType === "beneficiary") && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Comunidad"
            value={community}
            onChangeText={setCommunity}
          />
        </>
      )}

      {userType === "beneficiary" && (
        <TextInput
          style={styles.input}
          placeholder="Tamaño de familia"
          keyboardType="numeric"
          value={familySize}
          onChangeText={setFamilySize}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

     {userType == "admin" && (
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.signUp}>
          ¿Ya tienes cuenta?{" "}
          <Text style={styles.signUpLink}>Inicia sesión</Text>
        </Text>
      </TouchableOpacity>
    )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 20 },
  title: { fontSize: 28, marginBottom: 30, fontWeight: "bold", color: "black" },
  input: { width: "100%", height: 50, backgroundColor: "#f1f1f1", borderRadius: 8, paddingHorizontal: 10, marginBottom: 15 },
  button: { width: "100%", height: 50, backgroundColor: "#1E90FF", borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  buttonText: { color: "#fff", fontSize: 18 },
  signUp: { color: "#000" },
  signUpLink: { color: "#1E90FF" },
});
