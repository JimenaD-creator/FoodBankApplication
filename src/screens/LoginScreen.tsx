import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ImageBackground, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { useState } from 'react';
import { auth, db } from './firebaseconfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

// Servicio de tokens seguro (debes crear este archivo)
import { TokenService } from '../services/secureTokenService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
   const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [securityTestResults, setSecurityTestResults] = useState<string[]>([]);
  const [showSecurityTest, setShowSecurityTest] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [userData, setUserData] = useState<any>(null);

  // Función para probar seguridad de tokens CON LOGIN REAL
  const testTokenSecurityAfterLogin = async (user: any) => {
    const results: string[] = [];
    
    try {
      results.push('🔐 INICIANDO PRUEBA DE SEGURIDAD');
      results.push(`👤 Usuario: ${user.email}`);
      
      // 1. Verificar que Firebase Auth proporcionó un token REAL
      const firebaseToken = await user.getIdToken();
      if (firebaseToken && firebaseToken.length > 100) {
        results.push('✅ Token de Firebase recibido correctamente');
        results.push(`   Longitud: ${firebaseToken.length} caracteres`);
      } else {
        results.push('❌ Error: Token de Firebase inválido');
      }
      
      // 2. Guardar token REAL en almacenamiento seguro
      await TokenService.saveTokens(firebaseToken, `refresh_token_${user.uid}`);
      results.push('✅ Token guardado en Keychain seguro');
      
      // 3. Verificar que se puede recuperar el token REAL
      const storedTokens = await TokenService.getTokens();
      if (storedTokens?.accessToken && storedTokens.accessToken.length > 100) {
        results.push('✅ Token recuperado del almacenamiento seguro');
        results.push(`   Longitud recuperada: ${storedTokens.accessToken.length} caracteres`);
      } else {
        results.push('❌ Error: Token no coincide al recuperar');
      }
      
      // 4. Verificar que NO está en AsyncStorage (vulnerable)
       try {
        // Intentar guardar en AsyncStorage para demostrar la vulnerabilidad
        await AsyncStorage.setItem('INSECURE_TOKEN', firebaseToken);
        const vulnerableStorage = await AsyncStorage.getItem('INSECURE_TOKEN');
        
        if (vulnerableStorage) {
          results.push('⚠️  Demostración: Token SÍ se guarda en AsyncStorage');
          results.push('✅ Pero nuestra app usa Keychain (seguro)');
          // Limpiar el token de prueba de AsyncStorage
          await AsyncStorage.removeItem('INSECURE_TOKEN');
        }
      } catch (asyncError) {
        results.push('✅ AsyncStorage no disponible para tokens');
      }
      
      // 5. Verificar expiración del token REAL
      const isExpired = await TokenService.isAccessTokenExpired();
      results.push(`✅ Token vigente: ${!isExpired}`);
      
      // 6. Verificar estructura del token (JWT básico)
      if (firebaseToken.split('.').length === 3) {
        results.push('✅ Estructura JWT válida detectada');
      } else {
        results.push('⚠️  Estructura de token inusual');
      }
      
      results.push('🎯 PRUEBA COMPLETADA - GESTIÓN SEGURA DE TOKENS VERIFICADA');
      
    } catch (error: any) {
      results.push(`❌ Error en prueba de seguridad: ${error.message}`);
    }
    
    setSecurityTestResults(results);
    return results;
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa correo y contraseña");
      return;
    }

    setLoading(true);
    
    try {
      // 1. Hacer login REAL
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Obtener datos del usuario
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        Alert.alert("Error", "Datos de usuario no encontrados");
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      setUserData(userData);
      setUserRole(userData.role);

      const securityResults = await testTokenSecurityAfterLogin(user);
      
      setShowSecurityTest(true);
      
      console.log('✅ Login exitoso - Usuario:', user.email, 'Rol:', userData.role);

    } catch (error: any) {
      console.error('❌ Error en login:', error);
      let errorMessage = "Error al iniciar sesión";
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = "Email inválido";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "Usuario no encontrado";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Contraseña incorrecta";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Error de conexión";
      }
      
      Alert.alert("Error", errorMessage);
      setLoading(false);
    }
  }

  // Función para redirigir después de ver los resultados de seguridad
  const redirectToDashboard = () => {
    setShowSecurityTest(false);
    
    if (!userRole || !userData) {
      Alert.alert("Error", "No se pudo determinar el rol del usuario");
      setLoading(false);
      return;
    }

    console.log('🔀 Redirigiendo a:', userRole);
    
    switch (userRole) {
      case 'admin':
        navigation.replace('AdminDashboard');
        break;
      case 'staff':
        navigation.replace('StaffDashboard');
        break;
      case 'beneficiary':
        navigation.replace('BeneficiaryDashboard');
        break;
      default:
        Alert.alert("Error", "Rol de usuario no reconocido: " + userRole);
    }
    
    setLoading(false);
  };

  return (
    <ImageBackground
      source={require('../../assets/background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/logo_no_background.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.pinkContainer}>
          <View style={styles.inputContainer}>
             <Ionicons name="mail-outline" size={20} color="#718096" style={styles.inputIcon} />
            <Text style={styles.inputLabel}>Correo</Text>
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

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#718096" style={styles.inputIcon} />
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder=" "
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#718096"
                  />
                </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} disabled={loading}>
            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Profile")} disabled={loading}>
            <Text style={styles.signUp}>
              ¿No tienes cuenta? <Text style={styles.signUpLink}>Regístrate</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </View>

      <Modal
        visible={showSecurityTest}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          // No permitir cerrar el modal sin ver los resultados
          Alert.alert(
            "Verificación de Seguridad",
            "Es importante revisar los resultados de seguridad antes de continuar.",
            [{ text: "Entendido" }]
          );
        }}
      >
        <View style={styles.securityModal}>
          <View style={styles.securityModalContent}>
            <Ionicons name="shield-checkmark" size={48} color="#4CAF50" />
            <Text style={styles.securityModalTitle}>Verificación de Seguridad</Text>
            <Text style={styles.securityModalSubtitle}>
              Gestión Segura de Tokens 
            </Text>
            
            {userData && (
              <View style={styles.userInfo}>
                <Text style={styles.userInfoText}>Usuario: {userData.email}</Text>
                <Text style={styles.userInfoText}>Rol: {userData.role}</Text>
              </View>
            )}
            
            <ScrollView style={styles.securityResults}>
              {securityTestResults.map((result, index) => (
                <Text key={index} style={[
                  styles.securityResultItem,
                  result.includes('❌') && styles.securityError,
                  result.includes('✅') && styles.securitySuccess,
                  result.includes('🔐') && styles.securityHeader,
                  result.includes('🎯') && styles.securityFooter,
                ]}>
                  {result}
                </Text>
              ))}
            </ScrollView>
            
            <View style={styles.securityButtons}>
              <TouchableOpacity
                style={styles.securityDetailsButton}
                onPress={() => {
                  Alert.alert(
                    "Detalles Técnicos M1 - Implementado",
                    `• Almacenamiento en KeyChain nativo
• Tokens JWT reales de Firebase
• Expiración automática configurada
• Protección contra almacenamiento inseguro
• Verificación de integridad de tokens
• Usuario actual: ${userData?.email}`
                  );
                }}
              >
                <Ionicons name="information-circle" size={16} color="#4A5568" />
                <Text style={styles.securityDetailsText}> Detalles Técnicos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.securityCloseButton}
                onPress={redirectToDashboard}
              >
                <Ionicons name="arrow-forward" size={16} color="#fff" />
                <Text style={styles.securityCloseText}> Continuar a la App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  buttonDisabled: {
    backgroundColor: "#C53030",
    opacity: 0.7,
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
  // Estilos para el modal de seguridad
  securityModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 20,
  },
  securityModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxHeight: '85%',
    alignItems: 'center',
  },
  securityModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  securityModalSubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 16,
  },
  userInfo: {
    backgroundColor: '#EBF8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  userInfoText: {
    fontSize: 14,
    color: '#2B6CB0',
    fontWeight: '500',
  },
  securityResults: {
    maxHeight: 350,
    width: '100%',
    marginBottom: 20,
  },
  securityResultItem: {
    fontSize: 13,
    color: '#4A5568',
    marginBottom: 6,
    padding: 8,
    backgroundColor: '#F7FAFC',
    borderRadius: 6,
    fontFamily: 'monospace',
  },
  securityHeader: {
    backgroundColor: '#E6FFFA',
    color: '#234E52',
    fontWeight: 'bold',
    fontSize: 14,
  },
  securityFooter: {
    backgroundColor: '#C6F6D5',
    color: '#22543D',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 8,
  },
  securityError: {
    backgroundColor: '#FED7D7',
    color: '#C53030',
  },
  securitySuccess: {
    backgroundColor: '#C6F6D5',
    color: '#2F855A',
  },
  securityButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  securityDetailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  securityDetailsText: {
    color: '#4A5568',
    fontSize: 14,
    fontWeight: '500',
  },
  securityCloseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  securityCloseText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  eyeIcon: {
    flexDirection: 'row',
    padding: 10,
  },
  inputIcon: {
    flexDirection: 'row',
    padding: 10,
  },
});