import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';

export default function UserTypeScreen({ navigation }: any) {
  return (
    <ImageBackground 
      source={require('../../assets/background.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
       <View style={styles.overlay} />
      <View style={styles.container}>
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo_no_background.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Selection Container */}
        <View style={styles.selectionContainer}>
          <View style={styles.whiteBox}>
            <Text style={styles.title}>Elige tu tipo de cuenta</Text>

            <TouchableOpacity
              style={[styles.button, styles.beneficiaryButton]}
              onPress={() => navigation.navigate("Registrar", { userType: "beneficiary" })}
            >
              <Text style={[styles.buttonText, styles.darkText]}>Soy beneficiario</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.staffButton]}
              onPress={() => navigation.navigate("Registrar", { userType: "staff" })}
            >
              <Text style={[styles.buttonText, styles.darkText]}>Soy trabajador</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.adminButton]}
              onPress={() => navigation.navigate("Registrar", { userType: "admin" })}
            >
              <Text style={[styles.buttonText, styles.darkText]}>Soy administrativo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  logoContainer: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logo: {
    width: 300,
    height: 160,
    marginBottom: 10,
  },
  selectionContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  whiteBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#2D3748",
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 8,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  beneficiaryButton: {
    backgroundColor: "#C4E2C4", // Verde claro
  },
  staffButton: {
    backgroundColor: "#FFEB99", // Amarillo claro
  },
  adminButton: {
    backgroundColor: "#FFCCCC", // Rosa claro
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  darkText: {
    color: "#2D3748", // Texto oscuro para mejor contraste
  },
});