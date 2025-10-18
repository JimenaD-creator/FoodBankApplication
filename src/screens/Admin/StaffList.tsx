import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ImageBackground, TouchableOpacity, TextInput, Alert } from "react-native";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseconfig";
import { Ionicons } from "@expo/vector-icons";

export default function StaffList({ navigation }: any) {
  const [staff, setStaff] = useState<any[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "users"), where("role", "==", "staff"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStaff(data);
        setFilteredStaff(data);
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = staff;

    // Filtro por texto
    if (searchText.trim() !== "") {
      filtered = filtered.filter(
        (item) =>
          item.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.community?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filtro por estado
    if (filterStatus !== "todos") {
      filtered = filtered.filter(
        (item) => item.status?.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    setFilteredStaff(filtered);
  }, [searchText, staff, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "activo":
      case "aprobado":
        return "#10B981";
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
      case "pendiente":
        return "time";
      case "inactivo":
      case "rechazado":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const validateStaff = async (id: string, name: string) => {
    Alert.alert(
      "Confirmar aprobación",
      `¿Deseas aprobar a ${name} para usar la aplicación?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aprobar",
          style: "default",
          onPress: async () => {
            try {
              const staffRef = doc(db, "users", id);
              await updateDoc(staffRef, { status: "Aprobado" });

              const updatedStaff = staff.map((s) =>
                s.id === id ? { ...s, status: "Aprobado" } : s
              );
              setStaff(updatedStaff);
              setFilteredStaff(updatedStaff);
              
              Alert.alert("¡Éxito!", `${name} ha sido aprobado correctamente.`);
            } catch (error) {
              console.error("Error aprobando trabajador:", error);
              Alert.alert("Error", "No se pudo aprobar al trabajador. Intenta nuevamente.");
            }
          },
        },
      ]
    );
  };

  const getStatsbyStatus = () => {
    const aprobados = staff.filter(s => s.status?.toLowerCase() === "aprobado").length;
    const pendientes = staff.filter(s => s.status?.toLowerCase() === "pendiente").length;
    const rechazados = staff.filter(s => s.status?.toLowerCase() === "rechazado" || s.status?.toLowerCase() === "inactivo").length;
    
    return { aprobados, pendientes, rechazados };
  };

  const stats = getStatsbyStatus();

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.8}
      onPress={() => {
        // Aquí podrías navegar a un detalle del staff
      }}
    >
      {/* Header con foto y nombre */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.avatarText, { color: getStatusColor(item.status) }]}>
              {item.fullName?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
        </View>
        
        <View style={styles.headerInfo}>
          <Text style={styles.cardName}>{item.fullName || "Nombre no definido"}</Text>
          <View style={styles.communityTag}>
            <Ionicons name="location" size={12} color="#6B7280" />
            <Text style={styles.communityText}>{item.community || "Sin asignar"}</Text>
          </View>
        </View>

        <View style={[styles.statusPill, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status)} size={14} color="#fff" />
        </View>
      </View>

      {/* Información de contacto */}
      <View style={styles.cardBody}>
        <View style={styles.infoItem}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="call" size={16} color="#6B7280" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{item.phone || "No registrado"}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="mail" size={16} color="#6B7280" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Correo</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{item.email || "No registrado"}</Text>
          </View>
        </View>
      </View>

      {/* Footer con acciones */}
      {item.status?.toLowerCase() === "pendiente" && (
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => validateStaff(item.id, item.fullName)}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.approveButtonText}>Aprobar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => {
              Alert.alert("Función no implementada", "Esta función estará disponible próximamente.");
            }}
          >
            <Ionicons name="close-circle" size={18} color="#EF4444" />
            <Text style={styles.rejectButtonText}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="people-outline" size={80} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>
        {searchText || filterStatus !== "todos" 
          ? "No se encontraron resultados" 
          : "No hay trabajadores registrados"}
      </Text>
      <Text style={styles.emptySubtext}>
        {searchText || filterStatus !== "todos"
          ? "Intenta ajustar los filtros de búsqueda"
          : "Los trabajadores aparecerán aquí cuando se registren"}
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Personal</Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </ImageBackground>

      {/* Contenido */}
      <View style={styles.content}>
        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{stats.aprobados}</Text>
            <Text style={styles.statLabel}>Aprobados</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="time" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{stats.pendientes}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#EF444420' }]}>
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>{stats.rechazados}</Text>
            <Text style={styles.statLabel}>Inactivos</Text>
          </View>
        </View>

        {/* Buscador */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o comunidad..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9CA3AF"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === "todos" && styles.filterChipActive]}
            onPress={() => setFilterStatus("todos")}
          >
            <Text style={[styles.filterChipText, filterStatus === "todos" && styles.filterChipTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterStatus === "aprobado" && styles.filterChipActive]}
            onPress={() => setFilterStatus("aprobado")}
          >
            <Text style={[styles.filterChipText, filterStatus === "aprobado" && styles.filterChipTextActive]}>
              Aprobados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterStatus === "pendiente" && styles.filterChipActive]}
            onPress={() => setFilterStatus("pendiente")}
          >
            <Text style={[styles.filterChipText, filterStatus === "pendiente" && styles.filterChipTextActive]}>
              Pendientes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterStatus === "inactivo" && styles.filterChipActive]}
            onPress={() => setFilterStatus("inactivo")}
          >
            <Text style={[styles.filterChipText, filterStatus === "inactivo" && styles.filterChipTextActive]}>
              Inactivos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contador de resultados */}
        <View style={styles.resultCounter}>
          <Text style={styles.resultText}>
            {filteredStaff.length} {filteredStaff.length === 1 ? 'resultado' : 'resultados'}
          </Text>
        </View>

        {/* Lista */}
        <FlatList
          data={filteredStaff}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={() => {}}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F9FAFB" 
  },
  headerBackground: { 
    paddingTop: 50, 
    paddingBottom: 30 
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "red",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  content: { 
    flex: 1, 
    padding: 16,
    marginTop: -15,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  searchContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#fff", 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  searchInput: { 
    flex: 1, 
    marginLeft: 10, 
    fontSize: 15, 
    color: "#1F2937" 
  },
  filtersContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: "#E53E3E",
    borderColor: "#E53E3E",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  resultCounter: {
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  listContainer: { 
    paddingBottom: 20,
  },
  card: { 
    backgroundColor: "#fff", 
    borderRadius: 16, 
    marginBottom: 12, 
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  communityTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  communityText: {
    fontSize: 13,
    color: "#6B7280",
  },
  statusPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  approveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  approveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  rejectButtonText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#1F2937", 
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: { 
    fontSize: 14, 
    color: "#6B7280", 
    textAlign: "center", 
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});