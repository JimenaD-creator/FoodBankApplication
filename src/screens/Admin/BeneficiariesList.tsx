import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseconfig";

export default function BeneficiariesList() {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Filtrar usuarios donde role === "beneficiary"
        const q = query(collection(db, "users"), where("role", "==", "beneficiary"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBeneficiaries(data);
      } catch (error) {
        console.error("Error fetching beneficiaries:", error);
      }
    };

    fetchData();
  }, []);

  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.fullName}</Text>
      <Text style={styles.info}>Comunidad: {item.community || "No definido"}</Text>
      <Text style={styles.info}>Teléfono: {item.phone || "No definido"}</Text>
      <Text style={styles.info}>Tamaño de familia: {item.familySize || "No definido"}</Text>
      <Text style={styles.status}>Estado: {item.status || "sin definir"}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Beneficiarios</Text>
      <FlatList
        data={beneficiaries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 30 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center", marginTop: 40},
  item: { backgroundColor: "#f9f9f9", padding: 15, borderRadius: 10, marginBottom: 10, elevation: 1 },
  name: { fontSize: 16, fontWeight: "bold" },
  info: { fontSize: 14, color: "#555" },
  status: { fontSize: 13, color: "#999", marginTop: 5 },
});
