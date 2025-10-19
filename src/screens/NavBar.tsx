// src/components/NavBar.tsx
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useActiveTab } from "../hooks/ActiveTabContext";
import { useUserRole } from "../hooks/UserContext";

export default function Navbar() {
  const { activeTab, setActiveTab } = useActiveTab();
  const { role } = useUserRole();

  const handleDashboardPress = () => {
    setActiveTab("dashboard");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setActiveTab("home")}
      >
        <Ionicons
          name="home"
          size={28}
          color={activeTab === "home" ? "#4CAF50" : "#718096"}
        />
        <Text style={[styles.label, activeTab === "home" && styles.activeLabel]}>
          Inicio
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleDashboardPress}>
        <Ionicons
          name="grid"
          size={28}
          color={activeTab === "dashboard" ? "#4CAF50" : "#718096"}
        />
        <Text
          style={[
            styles.label,
            activeTab === "dashboard" && styles.activeLabel,
          ]}
        >
          Dashboard
        </Text>
      </TouchableOpacity>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 6,
  },
  button: { justifyContent: "center", alignItems: "center" },
  label: { fontSize: 12, color: "#718096", marginTop: 2 },
  activeLabel: { color: "#4CAF50", fontWeight: "600" },
});
