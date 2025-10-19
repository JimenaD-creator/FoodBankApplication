<<<<<<< Updated upstream
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
=======
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
>>>>>>> Stashed changes
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

  const handleAccept = async () => {
    if (!accepted) {
      Alert.alert(
        "Confirmación requerida",
        "Debes marcar la casilla de aceptación para continuar.",
        [{ text: "Entendido" }]
      );
      return;
    }

    try {
      if (uid) {
        await acceptPrivacyPolicy(uid);
        if (onAccept) onAccept();
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar tu aceptación. Intenta nuevamente.");
    }
  };

  const openExternalLink = (url: string) => {
    Linking.openURL(url).catch(() => 
      Alert.alert("Error", "No se pudo abrir el enlace")
    );
  };

  return (
<<<<<<< Updated upstream
    <View style={styles.container}>
      {/* Header */}
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

      <ScrollView 
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo_no_background.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.introText}>
          En Banco de Alimentos, valoramos y protegemos tu privacidad. Por favor, lee atentamente nuestra política de privacidad antes de continuar.
        </Text>

        {/* Sección 1: Información que recopilamos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#E53E3E" />
            <Text style={styles.sectionTitle}>1. Información que Recopilamos</Text>
          </View>
          <Text style={styles.sectionText}>
            • <Text style={styles.bold}>Información personal:</Text> Nombre completo, dirección de correo electrónico, número de teléfono, dirección de residencia.
          </Text>
          <Text style={styles.sectionText}>
            • <Text style={styles.bold}>Información demográfica:</Text> Comunidad, tamaño de familia, información socioeconómica.
          </Text>
          <Text style={styles.sectionText}>
            • <Text style={styles.sectionText}>• <Text style={styles.bold}>Datos de uso:</Text> Historial de entregas, preferencias alimentarias, información de salud relevante para nuestro servicio.
          </Text> 
          </Text>
        </View>
        

        {/* Sección 2: Uso de la información */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>2. Uso de la Información</Text>
          </View>
          <Text style={styles.sectionText}>
            Utilizamos tu información para:
          </Text>
          <Text style={styles.sectionText}>
            • Proporcionar y mejorar nuestros servicios de distribución de alimentos
          </Text>
          <Text style={styles.sectionText}>
            • Personalizar las entregas según tus necesidades específicas
          </Text>
          <Text style={styles.sectionText}>
            • Comunicarnos contigo sobre entregas y actualizaciones del servicio
          </Text>
          <Text style={styles.sectionText}>
            • Cumplir con requisitos legales y regulatorios
          </Text>
        </View>

        {/* Sección 3: Protección de datos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed" size={24} color="#2196F3" />
            <Text style={styles.sectionTitle}>3. Protección de Datos</Text>
          </View>
          <Text style={styles.sectionText}>
            Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra accesos no autorizados, pérdida o alteración.
          </Text>
          <Text style={styles.sectionText}>
            Tus datos se almacenan en servidores seguros y solo el personal autorizado tiene acceso a la información necesaria para realizar sus funciones.
          </Text>
        </View>

        {/* Sección 4: Compartir información */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={24} color="#FF9800" />
            <Text style={styles.sectionTitle}>4. Compartir Información</Text>
          </View>
          <Text style={styles.sectionText}>
            No vendemos ni alquilamos tu información personal a terceros. Podemos compartir información con:
          </Text>
          <Text style={styles.sectionText}>
            • <Text style={styles.bold}>Voluntarios autorizados:</Text> Solo la información necesaria para realizar las entregas
          </Text>
          <Text style={styles.sectionText}>
            • <Text style={styles.bold}>Autoridades:</Text> Cuando sea requerido por ley
          </Text>
          <Text style={styles.sectionText}>
            • <Text style={styles.bold}>Proveedores de servicio:</Text> Para operaciones técnicas esenciales
          </Text>
        </View>

        {/* Sección 5: Tus derechos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={24} color="#9C27B0" />
            <Text style={styles.sectionTitle}>5. Tus Derechos</Text>
          </View>
          <Text style={styles.sectionText}>
            Tienes derecho a:
          </Text>
          <Text style={styles.sectionText}>
            • Acceder a tu información personal
          </Text>
          <Text style={styles.sectionText}>
            • Corregir información inexacta
          </Text>
          <Text style={styles.sectionText}>
            • Solicitar la eliminación de tus datos
          </Text>
          <Text style={styles.sectionText}>
            • Oponerte al procesamiento de tu información
          </Text>
          <Text style={styles.sectionText}>
            • Solicitar la portabilidad de tus datos
          </Text>
        </View>

        {/* Sección 6: Contacto */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail" size={24} color="#607D8B" />
            <Text style={styles.sectionTitle}>6. Contacto y Dudas</Text>
          </View>
          <Text style={styles.sectionText}>
            Si tienes preguntas sobre esta política de privacidad o deseas ejercer tus derechos, contáctanos:
          </Text>
          <TouchableOpacity 
            style={styles.contactLink}
            onPress={() => openExternalLink('mailto:privacidad@bdalimentos.org')}
          >
            <Ionicons name="mail-outline" size={16} color="#E53E3E" />
            <Text style={styles.contactText}>privacidad@bdalimentos.org</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.contactLink}
            onPress={() => openExternalLink('https://bdalimentos.org')}
          >
            <Ionicons name="globe-outline" size={16} color="#E53E3E" />
            <Text style={styles.contactText}>bdalimentos.org</Text>
          </TouchableOpacity>
        </View>

        {/* Checkbox de aceptación */}
        <View style={styles.acceptanceContainer}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setAccepted(!accepted)}
          >
            <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
              {accepted && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkboxText}>
              He leído y acepto la Política de Privacidad de Banco de Alimentos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Fecha de última actualización */}
        <Text style={styles.updateDate}>
          Última actualización: {new Date().toLocaleDateString('es-MX')}
        </Text>
      </ScrollView>

      {/* Botón de aceptar */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, !accepted && styles.buttonDisabled]}
          onPress={handleAccept}
          disabled={!accepted}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.buttonText}>Aceptar y Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
=======
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Política de Privacidad</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>Última actualización: {new Date().toLocaleDateString("es-MX")}</Text>
        <Text style={styles.sectionTitle}>1. Información que Recopilamos</Text>
        <Text style={styles.paragraph}>Recopilamos información personal que usted nos proporciona directamente, incluyendo:</Text>
        <Text style={styles.bulletPoint}>• Nombre completo y datos de contacto</Text>
        <Text style={styles.bulletPoint}>• Información demográfica y socioeconómica</Text>
        <Text style={styles.bulletPoint}>• Datos de ubicación de comunidades</Text>
        <Text style={styles.bulletPoint}>• Fotografías y documentos de identificación</Text>
        <Text style={styles.bulletPoint}>• Información de entregas y beneficios recibidos</Text>

        <Text style={styles.sectionTitle}>2. Uso de la Información</Text>
        <Text style={styles.paragraph}>Utilizamos la información recopilada para:</Text>
        <Text style={styles.bulletPoint}>• Gestionar y coordinar entregas de despensas</Text>
        <Text style={styles.bulletPoint}>• Verificar la identidad de beneficiarios</Text>
        <Text style={styles.bulletPoint}>• Realizar estudios socioeconómicos</Text>
        <Text style={styles.bulletPoint}>• Generar reportes y estadísticas</Text>
        <Text style={styles.bulletPoint}>• Mejorar nuestros servicios</Text>

        {/* Agrega más secciones según necesites */}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Botón siempre visible */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.acceptButtonText}>Aceptar Política de Privacidad</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
>>>>>>> Stashed changes
  );
}

const styles = StyleSheet.create({
<<<<<<< Updated upstream
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 60,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
    marginBottom: 8,
  },
  bold: {
    fontWeight: '600',
    color: '#1F2937',
  },
  contactLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#E53E3E',
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
  acceptanceContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#E53E3E',
    borderColor: '#E53E3E',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    fontWeight: '500',
  },
  updateDate: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#E53E3E',
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
=======
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#D3D3D3",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#000" },
  placeholder: { width: 40 },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  lastUpdated: { fontSize: 12, color: "#718096", marginBottom: 20, fontStyle: "italic" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#2D3748", marginTop: 20, marginBottom: 10 },
  paragraph: { fontSize: 14, color: "#4A5568", lineHeight: 22, marginBottom: 10 },
  bulletPoint: { fontSize: 14, color: "#4A5568", lineHeight: 22, marginLeft: 10, marginBottom: 5 },
  bottomSpacing: { height: 40 },
  footer: { padding: 20, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  acceptButton: { backgroundColor: "#4CAF50", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  acceptButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
>>>>>>> Stashed changes
