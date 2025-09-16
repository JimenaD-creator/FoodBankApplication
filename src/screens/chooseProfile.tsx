import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';


export default function UserTypeScreen({navigation}: any) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Elige tu tipo de cuenta</Text>
            <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Registrar", {userType: "Administrador"})}
            >
                <Text style={styles.buttonText}>Administrador</Text>

            </TouchableOpacity>

            <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Registrar", {userType: "Beneficiario"})}
            >
                <Text style={styles.buttonText}>Beneficiario</Text>

            </TouchableOpacity>

            <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Registrar", {userType: "Trabajador"})}
            >
                <Text style={styles.buttonText}>Trabajador</Text>

            </TouchableOpacity>

        </View>
    )

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#6200EE",
  },
  button: {
    backgroundColor: "#6200EE",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

