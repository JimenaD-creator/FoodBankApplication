import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { acceptPrivacyPolicy } from '../services/privacyService';

export default function PrivacyPolicyScreen({ route, navigation }: any) {
  const { uid, onAccept } = route.params;

  const handleAccept = async () => {
    if (uid) {
      await acceptPrivacyPolicy(uid);
      if (onAccept) onAccept();
    }
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
