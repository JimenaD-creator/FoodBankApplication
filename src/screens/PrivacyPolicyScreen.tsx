import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  Alert,
  ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { acceptPrivacyPolicy } from '../services/privacyService';
import { useState } from 'react';

interface PrivacyPolicyScreenProps {
  navigation: any;
  route: {
    params: {
      uid: string;
      onAccept?: () => void;
    };
  };
}

export default function PrivacyPolicyScreen({ navigation, route }: PrivacyPolicyScreenProps) {
  const { uid, onAccept } = route.params;
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ Agregar estado de loading

  const handleAccept = async () => {
    if (!accepted) {
      Alert.alert(
        "Confirmación requerida",
        "Debes aceptar los términos y condiciones para continuar.",
        [{ text: "Entendido" }]
      );
      return;
    }

    try {
      setLoading(true); // ✅ Iniciar loading
      
      if (uid) {
        await acceptPrivacyPolicy(uid);
        console.log("✅ Aceptación guardada correctamente para:", uid);
        
        if (onAccept) {
          onAccept();
        }
        
        // ✅ CORREGIDO: Especificar la ruta de navegación
        navigation.navigate('HomeScreen'); // O la ruta que corresponda
        // Alternativa: navigation.goBack() si vienes del registro
      }
    } catch (error) {
      console.error("❌ Error en handleAccept:", error);
      Alert.alert(
        "Error", 
        "No se pudo guardar tu aceptación. Intenta nuevamente."
      );
    } finally {
      setLoading(false); // ✅ Finalizar loading
    }
  };

  const openExternalLink = (url: string) => {
    Linking.openURL(url).catch(() => 
      Alert.alert("Error", "No se pudo abrir el enlace")
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground 
        source={require('../../assets/background.jpg')}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Política de Privacidad</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </ImageBackground>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Última actualización: {new Date().toLocaleDateString('es-MX')}</Text>
          
          <Text style={styles.paragraph}>
            En <Text style={styles.bold}>BAMX Logistics App</Text>, valoramos y respetamos tu privacidad. Esta política describe cómo recopilamos, usamos y protegemos tu información personal.
          </Text>

          <Text style={styles.sectionTitle}>1. Información que Recopilamos</Text>
          <Text style={styles.paragraph}>
            • Información personal: nombre, dirección, teléfono{"\n"}
            • Datos de ubicación para coordinación de entregas{"\n"}
            • Información de contacto de emergencia{"\n"}
            • Datos de uso de la aplicación
          </Text>

          <Text style={styles.sectionTitle}>2. Uso de la Información</Text>
          <Text style={styles.paragraph}>
            Utilizamos tu información para:{"\n"}
            • Coordinar entregas de despensas{"\n"}
            • Comunicarnos sobre entregas programadas{"\n"}
            • Mejorar nuestros servicios{"\n"}
            • Cumplir con obligaciones legales
          </Text>

          <Text style={styles.sectionTitle}>3. Protección de Datos</Text>
          <Text style={styles.paragraph}>
            Implementamos medidas de seguridad técnicas y organizativas para proteger tu información contra accesos no autorizados, pérdida o alteración.
          </Text>

          <Text style={styles.sectionTitle}>4. Compartir Información</Text>
          <Text style={styles.paragraph}>
            No vendemos ni alquilamos tu información personal. Solo compartimos datos con:{"\n"}
            • Voluntarios autorizados para coordinación de entregas{"\n"}
            • Autoridades cuando es requerido por ley{"\n"}
            • Proveedores de servicios esenciales
          </Text>

          <Text style={styles.sectionTitle}>5. Tus Derechos</Text>
          <Text style={styles.paragraph}>
            Tienes derecho a:{"\n"}
            • Acceder a tu información personal{"\n"}
            • Corregir datos inexactos{"\n"}
            • Solicitar la eliminación de tus datos{"\n"}
            • Oponerte al procesamiento de datos
          </Text>

          <Text style={styles.sectionTitle}>6. Contacto</Text>
          <Text style={styles.paragraph}>
            Para preguntas sobre esta política o ejercer tus derechos, contáctanos en:{"\n"}
            <Text style={styles.link}>privacidad@bamx.org.mx</Text>
          </Text>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* Footer with Acceptance */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
            {accepted && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxText}>
            He leído y acepto los términos y condiciones de la política de privacidad
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.acceptButton,
            (!accepted || loading) && styles.acceptButtonDisabled
          ]}
          onPress={handleAccept}
          disabled={!accepted || loading}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.acceptButtonText}>
            {loading ? "Procesando..." : "Aceptar y Continuar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Los estilos se mantienen igual...
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F7FAFC" 
  },
  headerBackground: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: { 
    padding: 4 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#E53E3E",
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  headerPlaceholder: { 
    width: 24 
  },
  scrollView: { 
    flex: 1 
  },
  content: { 
    padding: 24 
  },
  lastUpdated: { 
    fontSize: 12, 
    color: "#718096", 
    marginBottom: 24, 
    fontStyle: "italic",
    textAlign: 'center'
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#2D3748", 
    marginTop: 24, 
    marginBottom: 12 
  },
  paragraph: { 
    fontSize: 14, 
    color: "#4A5568", 
    lineHeight: 22, 
    marginBottom: 16 
  },
  bold: {
    fontWeight: 'bold',
    color: '#2D3748'
  },
  link: {
    color: '#2196F3',
    fontWeight: '500'
  },
  bottomSpacing: { 
    height: 20 
  },
  footer: { 
    padding: 20, 
    backgroundColor: "#fff", 
    borderTopWidth: 1, 
    borderTopColor: "#E2E8F0",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CBD5E0",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 20,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  acceptButtonDisabled: {
    backgroundColor: "#CBD5E0",
    shadowOpacity: 0,
  },
  acceptButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
});