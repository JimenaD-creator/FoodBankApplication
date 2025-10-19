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

export default function PrivacyPolicyScreen({ route, navigation }: any) {
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
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <Text style={styles.title}>Política de Privacidad</Text>
        <Text style={styles.text}>
          {/* Aquí va el contenido de la política */}
          Bienvenido, por favor lee y acepta nuestra política de privacidad para continuar.
        </Text>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleAccept}>
        <Text style={styles.buttonText}>Aceptar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  scroll: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
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
    fontWeight: "600",
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
