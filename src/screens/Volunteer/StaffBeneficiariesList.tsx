import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ImageBackground, TouchableOpacity, TextInput } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseconfig";
import { Ionicons } from "@expo/vector-icons";

export default function StaffBeneficiariesList({ navigation }: any) {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Filtrar usuarios donde role === "beneficiary" 
        const q = query(collection(db, "users"), where("role", "==", "beneficiary"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBeneficiaries(data);
        setFilteredBeneficiaries(data);
      } catch (error) {
        console.error("Error fetching beneficiaries:", error);
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
        return "#10B981";
      case "evaluación":
        return "#2196F3";
      case "pendiente":
        return "#F59E0B";
      case "inactivo":
      case "rechazado":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "activo":
      case "aprobado":
        return "checkmark-circle";
      case "evaluación":
        return "document-text-outline";
      case "pendiente":
        return "time-outline";
      case "inactivo":
      case "rechazado":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const renderItem = ({ item }: any) => {
    const canDoStudy = item.status?.toLowerCase() === "evaluación";
    const isPending = item.status?.toLowerCase() === "pendiente";
    const isApproved = item.status?.toLowerCase() === "aprobado" || item.status?.toLowerCase() === "activo";

    return (
      <TouchableOpacity style={styles.item} activeOpacity={0.7}>
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
          
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color="#718096" />
            <Text style={styles.info}>
              <Text style={styles.infoLabel}>Familia: </Text>
              {item.familySize ? `${item.familySize} personas` : "No definido"}
            </Text>
          </View>
        </View>
        {canDoStudy ? (
          <TouchableOpacity
            style={styles.studyButton}
            onPress={() => navigation.navigate("SocioEconomicSurvey", { origin: item.id })}
          >
            <Ionicons name="document-text-outline" size={16} color="#2196F3" />
            <Text style={styles.studyButtonText}>Hacer Estudio Socioeconómico</Text>
          </TouchableOpacity>
        ) : isPending ? (
          // ESTADO PENDIENTE: Información de validación
          <View style={styles.disabledStudyContainer}>
            <View style={styles.disabledStudyButton}>
              <Ionicons name="time-outline" size={16} color="#F59E0B" />
              <Text style={styles.disabledStudyButtonText}>Validación Pendiente</Text>
            </View>
            <Text style={styles.disabledStudyInfo}>
              El beneficiario debe de responder un estudio inicial
            </Text>
          </View>
        ) : isApproved ? (
          // ESTADO APROBADO: Indicador de completado
          <View style={styles.approvedContainer}>
            <View style={styles.approvedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.approvedText}>Estudio Completado</Text>
            </View>
            <View style={styles.approvedInfo}>
              <Ionicons name="information-circle" size={14} color="#6B7280" />
              <Text style={styles.approvedInfoText}>
                Beneficiario aprobado y listo para recibir apoyos
              </Text>
            </View>
          </View>
        ) : (
          // OTROS ESTADOS (inactivo, rechazado, etc.)
          <View style={styles.disabledStudyContainer}>
            <View style={styles.disabledStudyButton}>
              <Ionicons name="close-circle" size={16} color="#EF4444" />
              <Text style={styles.disabledStudyButtonText}>Estudio No Disponible</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.title}>Beneficiarios</Text>
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
            placeholder="Buscar beneficiario o comunidad..."
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
              {filteredBeneficiaries.length} beneficiario{filteredBeneficiaries.length !== 1 ? 's' : ''}
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
  studyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  studyButtonText: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "600",
  },
  disabledStudyContainer: {
    marginTop: 12,
  },
  disabledStudyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(156, 163, 175, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  disabledStudyButtonText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  disabledStudyInfo: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 6,
    fontStyle: "italic",
  },
  approvedContainer: {
    marginTop: 12,
    gap: 8,
  },
  approvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  approvedText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
  },
  approvedInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(107, 114, 128, 0.05)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  approvedInfoText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    flex: 1,
  },
});