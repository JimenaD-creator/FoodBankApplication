import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ImageBackground, TouchableOpacity, TextInput } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseconfig";
import { Ionicons } from "@expo/vector-icons";

export default function StaffList({ navigation }: any) {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Filtrar usuarios donde role === "beneficiary" 
        const q = query(collection(db, "users"), where("role", "==", "staff"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBeneficiaries(data);
        setFilteredBeneficiaries(data);
      } catch (error) {
        console.error("Error fetching volunteers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar beneficiarios por búsqueda
  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredBeneficiaries(beneficiaries);
    } else {
      const filtered = beneficiaries.filter((item) =>
        item.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.community?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredBeneficiaries(filtered);
    }
  }, [searchText, beneficiaries]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "activo":
      case "aprobado":
        return "#4CAF50";
      case "pendiente":
        return "#FF9800";
      case "inactivo":
      case "rechazado":
        return "#E53E3E";
      default:
        return "#718096";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "activo":
      case "aprobado":
        return "checkmark-circle";
      case "pendiente":
        return "time-outline";
      case "inactivo":
      case "rechazado":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const validateStaff = async (id: string) => {
  try {
    // Actualizar el estado en Firestore
    await db.collection("users").doc(id).update({
      status: "aprobado",
    });

    // Actualizar localmente
    const updatedBeneficiaries = beneficiaries.map((b) =>
      b.id === id ? { ...b, status: "aprobado" } : b
    );
    setBeneficiaries(updatedBeneficiaries);
    setFilteredBeneficiaries(updatedBeneficiaries);
  } catch (error) {
    console.error("Error validando trabajador:", error);
  }
};
const renderItem = ({ item }: any) => (
  <TouchableOpacity style={styles.item} activeOpacity={0.7}>
    {/* Header con nombre y estado */}
    <View style={styles.itemHeader}>
      <View style={styles.nameContainer}>
        <Ionicons name="person" size={20} color="#4CAF50" />
        <Text style={styles.name}>{item.fullName || "Nombre no definido"}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
        <Ionicons 
          name={getStatusIcon(item.status)} 
          size={12} 
          color="#fff" 
        />
        <Text style={styles.statusText}>{item.status || "Sin definir"}</Text>
      </View>
    </View>
    
    {/* Información adicional */}
    <View style={styles.infoContainer}>
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={16} color="#718096" />
        <Text style={styles.info}>
          <Text style={styles.infoLabel}>Comunidad: </Text>
          {item.community || "No definido"}
        </Text>
      </View>
      
      <View style={styles.infoRow}>
        <Ionicons name="call-outline" size={16} color="#718096" />
        <Text style={styles.info}>
          <Text style={styles.infoLabel}>Teléfono: </Text>
          {item.phone || "No definido"}
        </Text>
      </View>
    </View>

    {/* Botón Validar solo si no está aprobado */}
    {item.status?.toLowerCase() !== "aprobado" && (
      <View style={styles.itemFooter}>
        <TouchableOpacity
          style={styles.validateButton}
          onPress={() => validateStaff(item.id)}
        >
          <Text style={styles.validateButtonText}>Validar</Text>
        </TouchableOpacity>
      </View>
    )}
  </TouchableOpacity>
);


  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#E2E8F0" />
      <Text style={styles.emptyText}>
        {searchText ? "No se encontraron beneficiarios" : "No hay beneficiarios registrados"}
      </Text>
      <Text style={styles.emptySubtext}>
        {searchText ? "Intenta con otros términos de búsqueda" : "Los beneficiarios aparecerán aquí cuando se registren"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground 
        source={require('../../../assets/background.jpg')}
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
          <Text style={styles.title}>Trabajadores</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons name="filter-outline" size={24} color="#E53E3E" />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      {/* Contenido principal */}
      <View style={styles.content}>
        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#718096" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar comunidad..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#A0AEC0"
          />
          {searchText.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchText("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#A0AEC0" />
            </TouchableOpacity>
          )}
        </View>

        {/* Contador */}
        <View style={styles.counterContainer}>
          <View style={styles.counterBadge}>
            <Ionicons name="people" size={16} color="#4CAF50" />
            <Text style={styles.counterText}>
              {filteredBeneficiaries.length} trabajadore{filteredBeneficiaries.length !== 1 ? 's' : ''}
              {searchText && ` encontrado${filteredBeneficiaries.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
        </View>

        {/* Lista */}
        <FlatList
          data={filteredBeneficiaries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={() => {
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  itemFooter: {
    marginTop: 12,
  alignItems: "flex-end",
  }, 
  headerBackground: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E53E3E",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  headerActions: {
    flexDirection: "row",
  },
  headerActionButton: {
    padding: 5,
    marginLeft: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#2D3748",
  },
  clearButton: {
    padding: 5,
  },
  counterContainer: {
    marginBottom: 15,
  },
  counterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  counterText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  listContainer: {
    paddingBottom: 20,
  },
  item: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "600",
    marginLeft: 4,
  },
  infoContainer: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  info: {
    fontSize: 14,
    color: "#4A5568",
    marginLeft: 8,
    flex: 1,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#2D3748",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A5568",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  validateButton: {
  backgroundColor: "#4CAF50",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 12,
},
validateButtonText: {
  color: "#fff",
  fontWeight: "600",
  fontSize: 14,
},
});