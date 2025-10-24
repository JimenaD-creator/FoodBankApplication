import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db } from "../firebaseconfig";
import { collection, getDocs, addDoc, doc, getDoc, query, limit, where } from "firebase/firestore";

export default function DeliveryManagementScreen({ navigation }: any) {
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [standardTemplate, setStandardTemplate] = useState<any>(null);

  const [communities, setCommunities] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [volunteerFilter, setVolunteerFilter] = useState<string>("");
  
  // Función para generar ID único 
  const generateUniqueId = () => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `qr_${timestamp}_${randomPart}`;
  };

  const filteredVolunteers = volunteerFilter 
    ? volunteers.filter(volunteer => 
        volunteer.community && 
        volunteer.community.trim().toLowerCase() === volunteerFilter.trim().toLowerCase()
      )
    : volunteers;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar comunidades
        const communitiesSnapshot = await getDocs(collection(db, "communities"));
        const communitiesData = communitiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCommunities(communitiesData);

        // Cargar voluntarios
        const usersSnapshot = await getDocs(collection(db, "users"));
        const volunteersData = usersSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user) => user.role === "staff");
        setVolunteers(volunteersData.map((v) => ({ ...v, selected: false })));

        // Cargar plantilla estándar
        const templateDoc = await getDoc(doc(db, "deliveries", "standardTemplate"));
        if (templateDoc.exists()) {
          setStandardTemplate(templateDoc.data().products);
        }
      } catch (error) {
        console.error("Error loading data: ", error);
        Alert.alert("Error", "No se pudieron cargar los datos");
      }
    };
    fetchData();
  }, []);

  const toggleVolunteer = (id: string) => {
    setVolunteers((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, selected: !v.selected } : v
      )
    );
  };

  const handleSave = async () => {
  if (!selectedCommunity) {
    Alert.alert("Error", "Debes seleccionar una comunidad");
    return;
  }

  const selectedVolunteers = volunteers.filter((v) => v.selected);
  if (selectedVolunteers.length === 0) {
    Alert.alert("Error", "Debes asignar al menos un voluntario");
    return;
  }
  
  if (!standardTemplate || Object.keys(standardTemplate).length === 0) {
    Alert.alert("Error", "No se ha cargado la plantilla estándar. Intenta de nuevo.");
    console.log("standardTemplate es null o vacío:", standardTemplate);
    return;
  }

  console.log("Guardando con productos:", standardTemplate);
  console.log("Número de productos:", Object.keys(standardTemplate).length);

  try {
    const selectedCommunityData = communities.find(c => c.id === selectedCommunity);
    
    // Obtener QR existente de los beneficiarios o generar uno nuevo
    const beneficiariesWithQR = await Promise.all(beneficiaries.map(async (b) => {
      // Buscar si el beneficiario ya tiene un QR en entregas anteriores
      const existingDeliveriesQuery = query(
        collection(db, "scheduledDeliveries"),
        where("beneficiary.id", "==", b.id),
        limit(1)
      );
      const existingDeliveriesSnapshot = await getDocs(existingDeliveriesQuery);
      
      let existingQR = null;
      if (!existingDeliveriesSnapshot.empty) {
        existingQR = existingDeliveriesSnapshot.docs[0].data().beneficiary?.qrCode;
      }
      
      return {
        id: b.id,
        name: b.nombre || b.fullName,
        qrCode: existingQR || generateUniqueId(), // Usar QR existente o generar uno nuevo
        redeemed: false,
      };
    }));

    const deliveryPromises = beneficiariesWithQR.map(async (beneficiary) => {
      const deliveryRef = await addDoc(collection(db, "scheduledDeliveries"), {
        communityId: selectedCommunity,
        communityName: selectedCommunityData?.nombre || "",
        municipio: selectedCommunityData?.municipio || "",
        familias: selectedCommunityData?.familias || 0,
        deliveryDate: date,
        volunteers: selectedVolunteers.map((v) => ({
          id: v.id,
          name: v.fullName || v.name,
        })),
        beneficiary: {
          id: beneficiary.id,
          name: beneficiary.name,
          qrCode: beneficiary.qrCode, // Mismo QR para todas las entregas del beneficiario
          redeemed: beneficiary.redeemed,
        },
        products: standardTemplate,
        status: "Programada",
        createdAt: new Date(),
        deliveryId: generateUniqueId(),
      });
      return deliveryRef.id;
    });

    // Esperar a que todas las entregas se guarden
    const deliveryIds = await Promise.all(deliveryPromises);

    console.log("✅ Entregas guardadas con IDs:", deliveryIds);
    console.log("👥 Entregas individuales creadas:", beneficiariesWithQR.length);
    console.log("📦 Productos por entrega:", Object.keys(standardTemplate).length);

    Alert.alert(
      "Éxito", 
      `Se programaron ${beneficiariesWithQR.length} entregas correctamente`,
      [
        { text: "OK", onPress: () => navigation.goBack() }
      ]
    );
  } catch (error) {
    console.error("Error saving deliveries: ", error);
    Alert.alert("Error", "No se pudieron guardar las entregas");
  }
};

  const selectedCommunityData = communities.find(c => c.id === selectedCommunity);

  return (
    <View style={styles.container}>
      {/* Header Mejorado */}
      <ImageBackground 
        source={require('../../../assets/background.jpg')}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Programar Entrega</Text>
            <Text style={styles.headerSubtitle}>Nueva distribución de despensas</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
      </ImageBackground>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info de plantilla - Mejorado */}
        {standardTemplate && (
          <View style={styles.templateInfoBanner}>
            <View style={styles.templateIconContainer}>
              <Ionicons name="cube" size={22} color="#2196F3" />
            </View>
            <View style={styles.templateTextContainer}>
              <Text style={styles.templateInfoTitle}>Plantilla estándar cargada</Text>
              <Text style={styles.templateInfoText}>
                {Object.keys(standardTemplate).length} productos listos para entrega
              </Text>
            </View>
          </View>
        )}

        {/* Tarjeta de Comunidad - Mejorada */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={20} color="#E53E3E" />
            <Text style={styles.cardTitle}>Comunidad de entrega</Text>
          </View>
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCommunity}
              onValueChange={async (itemValue) => {
                setSelectedCommunity(itemValue);

                if (itemValue) {
                  try {
                    const selectedCommunityData = communities.find((c) => c.id === itemValue);
                    const communityName = selectedCommunityData?.nombre;

                    const usersSnapshot = await getDocs(collection(db, "users"));
                    const usersData = usersSnapshot.docs.map((doc) => ({
                      id: doc.id,
                      ...doc.data(),
                    }));

                    const communityBeneficiaries = usersData.filter(
                      (user) =>
                        user.role === "beneficiary" &&
                        user.community &&
                        user.community.trim().toLowerCase() === communityName.trim().toLowerCase()
                    );

                    setBeneficiaries(communityBeneficiaries);
                    
                    console.log(
                      `Beneficiarios vinculados con comunidad ${communityName}:`,
                      communityBeneficiaries.length
                    );
                  } catch (error) {
                    console.error("Error al cargar beneficiarios:", error);
                  }
                } else {
                  setBeneficiaries([]);
                  setVolunteers([]);
                }
              }}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona una comunidad" value="" />
              {communities.map((community) => (
                <Picker.Item
                  key={community.id}
                  label={`${community.municipio} - ${community.nombre}`}
                  value={community.id}
                />
              ))}
            </Picker>
          </View>

          {/* Info de comunidad seleccionada*/}
          {selectedCommunityData && (
            <View style={styles.communityInfoCard}>
              <View style={styles.communityStats}>
                <View style={styles.statItem}>
                  <Ionicons name="business" size={16} color="#4CAF50" />
                  <Text style={styles.statValue}>{selectedCommunityData.municipio}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={16} color="#2196F3" />
                  <Text style={styles.statValue}>{selectedCommunityData.familias} familias</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="person" size={16} color="#FF9800" />
                  <Text style={styles.statValue}>{beneficiaries.length} beneficiarios</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Tarjeta de Fecha y Hora */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={20} color="#E53E3E" />
            <Text style={styles.cardTitle}>Fecha y hora de entrega</Text>
          </View>
          
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={[styles.dateTimeIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="calendar" size={20} color="#2196F3" />
              </View>
              <View style={styles.dateTimeTextContainer}>
                <Text style={styles.dateTimeLabel}>Fecha de entrega</Text>
                <Text style={styles.dateTimeValue}>
                  {date.toLocaleDateString('es-MX', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={[styles.dateTimeIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="time" size={20} color="#FF9800" />
              </View>
              <View style={styles.dateTimeTextContainer}>
                <Text style={styles.dateTimeLabel}>Hora de entrega</Text>
                <Text style={styles.dateTimeValue}>
                  {date.toLocaleTimeString('es-MX', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) setDate(selectedTime);
            }}
          />
        )}

        {/* Tarjeta de Voluntarios */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={20} color="#E53E3E" />
            <Text style={styles.cardTitle}>Asignar voluntarios</Text>
          </View>

          {/* Filtro de comunidad para voluntarios */}
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Seleccionar comunidad:</Text>
            <View style={styles.filterPickerContainer}>
              <Picker
                selectedValue={volunteerFilter}
                onValueChange={(itemValue) => setVolunteerFilter(itemValue)}
                style={styles.filterPicker}
                dropdownIconColor="#E53E3E"
                mode="dropdown"
              >
                <Picker.Item 
                  label="Todos" 
                  value="" 
                  color="#718096"
                />
                {communities.map((community) => (
                  <Picker.Item
                    key={community.id}
                    label={`${community.municipio} - ${community.nombre}`}
                    value={community.nombre}
                    color="#2D3748"
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Lista de voluntarios filtrados */}
          {filteredVolunteers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#E2E8F0" />
              <Text style={styles.emptyStateText}>
                {volunteerFilter ? 
                  `No hay voluntarios en ${volunteerFilter}` : 
                  "No hay voluntarios disponibles"
                }
              </Text>
            </View>
          ) : (
            <View style={styles.volunteersGrid}>
              <Text style={styles.volunteersCount}>
                {filteredVolunteers.length} voluntario{filteredVolunteers.length !== 1 ? 's' : ''} disponible{filteredVolunteers.length !== 1 ? 's' : ''}
              </Text>
              {filteredVolunteers.map((volunteer) => (
                <TouchableOpacity
                  key={volunteer.id}
                  style={[
                    styles.volunteerCard,
                    volunteer.selected && styles.volunteerSelected,
                  ]}
                  onPress={() => toggleVolunteer(volunteer.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.volunteerCheckbox,
                    volunteer.selected && styles.volunteerCheckboxSelected
                  ]}>
                    {volunteer.selected && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <View style={styles.volunteerAvatar}>
                    <Ionicons name="person-circle" size={32} color="#718096" />
                  </View>
                  <View style={styles.volunteerInfo}>
                    <Text style={styles.volunteerName}>
                      {volunteer.fullName || volunteer.name}
                    </Text>
                    {volunteer.community && (
                      <Text style={styles.volunteerCommunity}>
                        {volunteer.community}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {filteredVolunteers.filter(v => v.selected).length > 0 && (
            <View style={styles.selectedCountBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
              <Text style={styles.selectedCountText}>
                {filteredVolunteers.filter(v => v.selected).length} voluntario{filteredVolunteers.filter(v => v.selected).length !== 1 ? 's' : ''} seleccionado{filteredVolunteers.filter(v => v.selected).length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <View style={styles.saveButtonContent}>
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.saveButtonText}>Programar entrega</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingBottom: 50,
  },
  headerBackground: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E53E3E",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#718096",
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 100,
  },
  // Tarjetas principales
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
  },
  // Plantilla info
  templateInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(33, 150, 243, 0.08)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  templateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  templateTextContainer: {
    flex: 1,
  },
  templateInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2196F3",
    marginBottom: 2,
  },
  templateInfoText: {
    fontSize: 13,
    color: "#2196F3",
    opacity: 0.8,
  },
  // Pickers
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F7FAFC",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  // Info comunidad
  communityInfoCard: {
    marginTop: 12,
  },
  communityStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 13,
    color: "#4A5568",
    fontWeight: "500",
  },
  // Fecha y hora
  dateTimeContainer: {
    gap: 8,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dateTimeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dateTimeTextContainer: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 15,
    color: "#2D3748",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  // Filtro voluntarios - ESTILOS CORREGIDOS
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: "#4A5568",
    marginBottom: 8,
    fontWeight: "500",
  },
  filterPickerContainer: {
    borderWidth: 1,
    borderColor: "#E53E3E",
    borderRadius: 10,
    backgroundColor: "#FFF5F5",
    overflow: "hidden",
    minHeight: 50, // Aumentado para evitar corte vertical
  },
  filterPicker: {
    height: 50, // Aumentado para evitar corte vertical
    color: "#2D3748",
    fontSize: 14,
  },
  // Lista voluntarios
  volunteersGrid: {
    gap: 8,
  },
  volunteersCount: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 8,
    fontWeight: "500",
  },
  volunteerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F7FAFC",
  },
  volunteerSelected: {
    backgroundColor: "rgba(76, 175, 80, 0.08)",
    borderColor: "#4CAF50",
  },
  volunteerCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CBD5E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  volunteerCheckboxSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  volunteerAvatar: {
    marginRight: 12,
  },
  volunteerInfo: {
    flex: 1,
  },
  volunteerName: {
    fontSize: 15,
    color: "#2D3748",
    fontWeight: "500",
    marginBottom: 2,
  },
  volunteerCommunity: {
    fontSize: 12,
    color: "#718096",
  },
  selectedCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
    justifyContent: "center",
  },
  selectedCountText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#A0AEC0",
    marginTop: 8,
    textAlign: "center",
  },
  // Botón guardar
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 40,
    elevation: 4,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  saveButtonSubtext: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
});