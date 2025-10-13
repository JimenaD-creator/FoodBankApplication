// src/screens/UnauthorizedScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { auth } from '../screens/firebaseconfig';

export default function UnauthorizedScreen({navigation}: any) {
  const handleLogout = async () => {
    await auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acceso No Autorizado</Text>
      <Text style={styles.message}>
        No se pudo determinar tu rol en el sistema. 
        Contacta al administrador.
      </Text>
      <Button title="Cerrar Sesión" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
  },
});
