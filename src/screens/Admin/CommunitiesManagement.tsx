import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, ImageBackground, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseconfig";

// Municipios de Jalisco precargados
const MUNICIPIOS_JALISCO = [
  "Guadalajara",
  "Zapopan",
  "Tlaquepaque",
  "Tonalá",
  "Tlajomulco de Zúñiga",
  "El Salto",
  "Ajijic",
  "Chapala",
  "Puerto Vallarta",
  "Lagos de Moreno",
  "Tepatitlán de Morelos"
];

interface Community {
  id: string;
  municipio: string;
  nombre: string;
  familias: number;
  observaciones?: string;
  createdAt: Date;
}

export default function CommunitiesManagementScreen({ navigation }: any) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    municipio: "",
    nombre: "",
    familias: 0,
    observaciones: ""
  });

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      const snapshot = await getDocs(collection(db, "communities"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Community));
      
      // Ordenar por municipio y luego por nombre
      data.sort((a, b) => {
        if (a.municipio !== b.municipio) {
          return a.municipio.localeCompare(b.municipio);
        }
        return a.nombre.localeCompare(b.nombre);
      });
      
      setCommunities(data);
    } catch (error) {
      console.error("Error cargando comunidades:", error);
      Alert.alert("Error", "No se pudieron cargar las comunidades");
    }
  };

  const handleAddCommunity = async () => {
    if (!formData.municipio || !formData.nombre.trim()) {
      Alert.alert("Error", "Municipio y nombre son obligatorios");
      return;
    }

    if (formData.familias < 1) {
      Alert.alert("Error", "Ingresa una cantidad válida de familias");
      return;
    }

    try {
      await addDoc(collection(db, "communities"), {
        municipio: formData.municipio,
        nombre: formData.nombre.trim(),
        familias: formData.familias,
        observaciones: formData.observaciones.trim(),
        createdAt: new Date()
      });

      Alert.alert("Éxito", "Comunidad agregada correctamente");
      setShowAddModal(false);
      resetForm();
      loadCommunities();
    } catch (error) {
      console.error("Error agregando comunidad:", error);
      Alert.alert("Error", "No se pudo agregar la comunidad");
    }
  };

  const handleEditCommunity = async () => {
    if (!selectedCommunity || !formData.municipio || !formData.nombre.trim()) {
      Alert.alert("Error", "Municipio y nombre son obligatorios");
      return;
    }

    if (formData.familias < 1) {
      Alert.alert("Error", "Ingresa una cantidad válida de familias");
      return;
    }

    try {
      await updateDoc(doc(db, "communities", selectedCommunity.id), {
        municipio: formData.municipio,
        nombre: formData.nombre.trim(),
        familias: formData.familias,
        observaciones: formData.observaciones.trim()
      });

      Alert.alert("Éxito", "Comunidad actualizada correctamente");
      setShowEditModal(false);
      setSelectedCommunity(null);
      resetForm();
      loadCommunities();
    } catch (error) {
      console.error("Error actualizando comunidad:", error);
      Alert.alert("Error", "No se pudo actualizar la comunidad");
    }
  };

  const handleDeleteCommunity = (community: Community) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de eliminar "${community.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "communities", community.id));
              Alert.alert("Éxito", "Comunidad eliminada");
              loadCommunities();
            } catch (error) {
              console.error("Error eliminando comunidad:", error);
              Alert.alert("Error", "No se pudo eliminar la comunidad");
            }
          }
        }
      ]
    );
  };

  const openEditModal = (community: Community) => {
    setSelectedCommunity(community);
    setFormData({
      municipio: community.municipio,
      nombre: community.nombre,
      familias: community.familias,
      observaciones: community.observaciones || ""
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      municipio: "",
      nombre: "",
      familias: 0,
      observaciones: ""
    });
  };

  // Agrupar comunidades por municipio
  const groupedCommunities = communities.reduce((acc, community) => {
    if (!acc[community.municipio]) {
      acc[community.municipio] = [];
    }
    acc[community.municipio].push(community);
    return acc;
  }, {} as Record<string, Community[]>);

  const renderForm = (isEdit: boolean) => (
    <View>
      <Text style={styles.modalTitle}>
        {isEdit ? "Editar Comunidad" : "Nueva Comunidad"}
      </Text>

      {/* Selección de municipio */}
      <Text style={styles.label}>Municipio *</Text>
      <ScrollView style={styles.municipioList} nestedScrollEnabled>
        {MUNICIPIOS_JALISCO.map((municipio) => (
          <TouchableOpacity
            key={municipio}
            style={[
              styles.municipioOption,
              formData.municipio === municipio && styles.municipioSelected
            ]}
            onPress={() => setFormData({ ...formData, municipio })}
          >
            <Text style={[
              styles.municipioText,
              formData.municipio === municipio && styles.municipioTextSelected
            ]}>
              {municipio}
            </Text>
            {formData.municipio === municipio && (
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Nombre de la comunidad */}
      <Text style={styles.label}>Nombre de la comunidad *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Colonia Las Águilas"
        value={formData.nombre}
        onChangeText={(text) => setFormData({ ...formData, nombre: text })}
      />

      {/* Cantidad de familias */}
      <Text style={styles.label}>Cantidad de familias *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 50"
        keyboardType="numeric"
        value={formData.familias > 0 ? String(formData.familias) : ""}
        onChangeText={(text) => setFormData({ ...formData, familias: parseInt(text) || 0 })}
      />

      {/* Observaciones */}
      <Text style={styles.label}>Observaciones (opcional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Ej: Acceso difícil, enlace municipal: Juan Pérez"
        value={formData.observaciones}
        onChangeText={(text) => setFormData({ ...formData, observaciones: text })}
        multiline
        numberOfLines={3}
      />

      {/* Botones */}
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => {
            isEdit ? setShowEditModal(false) : setShowAddModal(false);
            resetForm();
            setSelectedCommunity(null);
          }}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Cancelar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={isEdit ? handleEditCommunity : handleAddCommunity}
        >
          <Text style={styles.buttonText}>
            {isEdit ? "Guardar cambios" : "Agregar"}
          </Text>
        </TouchableOpacity>
      </View>
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comunidades</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <Ionicons name="add-circle" size={28} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Contador */}
      <View style={styles.counterContainer}>
        <View style={styles.counterBadge}>
          <Ionicons name="location" size={16} color="#4CAF50" />
          <Text style={styles.counterText}>
            {communities.length} comunidad{communities.length !== 1 ? 'es' : ''}
          </Text>
        </View>
      </View>

      {/* Lista de comunidades agrupadas */}
      <ScrollView style={styles.content}>
        {Object.keys(groupedCommunities).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color="#E2E8F0" />
            <Text style={styles.emptyText}>No hay comunidades registradas</Text>
            <Text style={styles.emptySubtext}>
              Presiona el botón + para agregar una nueva comunidad
            </Text>
          </View>
        ) : (
          Object.entries(groupedCommunities).map(([municipio, comms]) => (
            <View key={municipio} style={styles.municipioGroup}>
              <Text style={styles.municipioHeader}>{municipio}</Text>
              {comms.map((community) => (
                <View key={community.id} style={styles.communityCard}>
                  <View style={styles.communityInfo}>
                    <View style={styles.communityMain}>
                      <Ionicons name="location" size={20} color="#4CAF50" />
                      <View style={styles.communityTextContainer}>
                        <Text style={styles.communityName}>{community.nombre}</Text>
                        <View style={styles.familyBadge}>
                          <Ionicons name="people" size={14} color="#718096" />
                          <Text style={styles.familyText}>
                            {community.familias} familia{community.familias !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {community.observaciones && (
                      <View style={styles.observationsContainer}>
                        <Ionicons name="information-circle-outline" size={16} color="#718096" />
                        <Text style={styles.observationsText}>
                          {community.observaciones}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.communityActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => openEditModal(community)}
                    >
                      <Ionicons name="pencil" size={20} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteCommunity(community)}
                    >
                      <Ionicons name="trash" size={20} color="#E53E3E" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal para agregar */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {renderForm(false)}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para editar */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {renderForm(true)}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E53E3E",
  },
  counterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  municipioGroup: {
    marginBottom: 25,
  },
  municipioHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 12,
  },
  communityCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  communityInfo: {
    flex: 1,
  },
  communityMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  communityTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  communityName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4,
  },
  familyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  familyText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 4,
  },
  observationsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft: 28,
  },
  observationsText: {
    fontSize: 13,
    color: "#718096",
    marginLeft: 6,
    flex: 1,
  },
  communityActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 8,
    marginTop: 12,
  },
  municipioList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 12,
  },
  municipioOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F7FAFC",
  },
  municipioSelected: {
    backgroundColor: "#E8F5E9",
  },
  municipioText: {
    fontSize: 16,
    color: "#4A5568",
  },
  municipioTextSelected: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#2D3748",
    backgroundColor: "#ffffff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#E53E3E",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  secondaryButtonText: {
    color: "#4A5568",
  },
});