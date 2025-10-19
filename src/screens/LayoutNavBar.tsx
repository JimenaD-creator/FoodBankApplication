// src/components/LayoutNavBar.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import Navbar from "./NavBar";
import TabContainer from "../hooks/TabContainer";

export default function LayoutNavBar() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TabContainer />
      </View>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F7FAFC" 
  },
  content: { 
    flex: 1, 
    marginBottom: 0 // Asegúrate de que no hay margen que empuje la navbar fuera de la pantalla
  },
});