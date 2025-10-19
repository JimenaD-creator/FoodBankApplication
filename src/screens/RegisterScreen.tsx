import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Image, 
  ImageBackground, 
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator
} from "react-native";
import { useState, useEffect } from "react";
import { auth, db } from "./firebaseconfig";
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";

interface Community {
  id: string;
  nombre: string;
}

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

  // Estados para el dropdown de comunidades
  const [communities, setCommunities] = useState<Community[]>([]);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [communitiesLoading, setCommunitiesLoading] = useState(false);

  // Estado para loading del registro
  const [registerLoading, setRegisterLoading] = useState(false);

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

  // Cargar comunidades al montar el componente
  useEffect(() => {
    if (userType === "staff" || userType === "beneficiary") {
      loadCommunities();
    }
  }, [userType]);

  const loadCommunities = async () => {
    try {
      setCommunitiesLoading(true);
      const communitiesSnapshot = await getDocs(collection(db, "communities"));
      const communitiesList: Community[] = [];
      
      communitiesSnapshot.forEach((doc) => {
        const data = doc.data();
        communitiesList.push({
          id: doc.id,
          nombre: data.nombre || doc.id
        });
      });

      // Ordenar alfabéticamente por nombre
      communitiesList.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setCommunities(communitiesList);
    } catch (error) {
      console.error("Error cargando comunidades:", error);
      Alert.alert("Error", "No se pudieron cargar las comunidades");
    } finally {
      setCommunitiesLoading(false);
    }
  };

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

  const handleCommunitySelect = (selectedCommunity: Community) => {
    setCommunity(selectedCommunity.nombre);
    setShowCommunityDropdown(false);
  };

  const renderCommunityItem = ({ item }: { item: Community }) => (
    <TouchableOpacity
      style={styles.communityItem}
      onPress={() => handleCommunitySelect(item)}
    >
      <Text style={styles.communityItemText}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Todos los campos básicos son obligatorios");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    // Validar comunidad para staff y beneficiarios
    if ((userType === "staff" || userType === "beneficiary") && !community) {
      Alert.alert("Error", "Por favor selecciona una comunidad");
      return;
    }

    setRegisterLoading(true);

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
            familySize: familySize || "0",
          };
        }

        // Guardar en Firestore
        await setDoc(doc(db, "users", user.uid), userData);
      }

      Alert.alert(
        "✅ Registro Exitoso", 
        "Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.",
        [
          {
            text: "Ir al Login",
            onPress: () => navigation.navigate("Login")
          },
          {
            text: "Quedarme aquí",
            style: "cancel"
          }
        ]
      );
          await signOut(auth);

      // Limpiar el formulario
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPhone("");
      setCommunity("");
      setFamilySize("");

    } catch (error: any) {
      console.error("Error en registro:", error);
      
      let errorMessage = "Error al registrar usuario";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este correo electrónico ya está registrado";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "La contraseña debe tener al menos 6 caracteres";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "El correo electrónico no es válido";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setRegisterLoading(false);
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
      
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Logo Container */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo_no_background.png')} 
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
                  editable={!registerLoading}
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
                  editable={!registerLoading}
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
                  editable={!registerLoading}
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
                  editable={!registerLoading}
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
                  editable={!registerLoading}
                />
              </View>

              {/* Campos adicionales según rol */}
              {(userType === "staff" || userType === "beneficiary") && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Comunidad</Text>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() => setShowCommunityDropdown(true)}
                    disabled={registerLoading}
                  >
                    <Text style={community ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>
                      {community || "Selecciona una comunidad"}
                    </Text>
                  </TouchableOpacity>
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
                    editable={!registerLoading}
                  />
                </View>
              )}

              <TouchableOpacity 
                style={[
                  styles.button, 
                  { backgroundColor: themeColors.buttonBg },
                  registerLoading && styles.buttonDisabled
                ]} 
                onPress={handleRegister}
                disabled={registerLoading}
              >
                {registerLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Registrarse</Text>
                )}
              </TouchableOpacity>

              {/* Enlace para ir al login */}
              <TouchableOpacity 
                style={styles.loginLink}
                onPress={() => navigation.navigate("Login")}
                disabled={registerLoading}
              >
                <Text style={styles.loginLinkText}>
                  ¿Ya tienes cuenta? <Text style={[styles.loginLinkBold, { color: themeColors.linkColor }]}>Inicia sesión</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal del Dropdown de Comunidades */}
      <Modal
        visible={showCommunityDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCommunityDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona una comunidad</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCommunityDropdown(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {communitiesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themeColors.buttonBg} />
                <Text style={styles.loadingText}>Cargando comunidades...</Text>
              </View>
            ) : (
              <FlatList
                data={communities}
                renderItem={renderCommunityItem}
                keyExtractor={(item:any) => item.id}
                style={styles.communitiesList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No hay comunidades disponibles</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
    width: 260,
    height: 140,
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
  containerBox: {
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
    backgroundColor: "#4CAF50", 
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#2D3748',
  },
  loginLinkBold: {
    fontWeight: '600',
  },

  // Estilos para el dropdown de comunidades
  dropdownTrigger: {
    height: 45,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dropdownTextSelected: {
    fontSize: 16,
    color: "#2D3748",
  },
  dropdownTextPlaceholder: {
    fontSize: 16,
    color: "#9CA3AF",
  },

  // Estilos para el modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxHeight: "70%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 20,
    color: "#6B7280",
    fontWeight: "bold",
  },
  communitiesList: {
    maxHeight: 400,
  },
  communityItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },
  communityItemText: {
    fontSize: 16,
    color: "#2D3748",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#718096",
  },
});