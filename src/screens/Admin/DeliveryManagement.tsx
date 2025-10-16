import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db } from "../firebaseconfig";
import { collection, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export default function DeliveryManagementScreen({ navigation }: any) {
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [standardTemplate, setStandardTemplate] = useState<any>(null);

  const [communities, setCommunities] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  
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
      
       // 🔹 Generar un código QR único por beneficiario
    const beneficiariesWithQR = beneficiaries.map((b) => ({
      id: b.id,
      name: b.nombre || b.fullName,
      qrCode: uuidv4(), // 🔹 Código único
      redeemed: false,  // 🔹 (Opcional) Campo para saber si ya fue usada la entrega
    }));

    // 🔹 Guardar la entrega completa
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
      beneficiaries: beneficiariesWithQR,
      products: standardTemplate,
      status: "Programada",
      createdAt: new Date(),
    });

      Alert.alert("Éxito", "Entrega programada correctamente", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error("Error saving delivery: ", error);
      Alert.alert("Error", "No se pudo guardar la entrega");
    }
  };

  const selectedCommunityData = communities.find(c => c.id === selectedCommunity);

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
          <Text style={styles.headerTitle}>Programar Entrega</Text>
          <View style={{ width: 24 }} />
        </View>
      </ImageBackground>

      <ScrollView style={styles.content}>
        {/* Info de plantilla */}
        {standardTemplate && (
          <View style={styles.templateInfoBanner}>
            <Ionicons name="cube" size={20} color="#2196F3" />
            <Text style={styles.templateInfoText}>
              Se usará la plantilla estándar con {Object.keys(standardTemplate).length} productos
            </Text>
          </View>
        )}

        {/* Selección de comunidad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comunidad</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCommunity}
              onValueChange={async (itemValue) => {
  setSelectedCommunity(itemValue);

  if (itemValue) {
    try {
       // Obtener datos de la comunidad seleccionada
      const selectedCommunityData = communities.find((c) => c.id === itemValue);
      const communityName = selectedCommunityData?.nombre;

      // Cargar todos los usuarios
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filtrar solo beneficiarios con esa comunidad por nombre
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

          {/* Info de comunidad seleccionada */}
          {selectedCommunityData && (
            <View style={styles.communityInfoCard}>
              <View style={styles.communityInfoRow}>
                <Ionicons name="location" size={18} color="#4CAF50" />
                <Text style={styles.communityInfoLabel}>Municipio:</Text>
                <Text style={styles.communityInfoValue}>{selectedCommunityData.municipio}</Text>
              </View>
              <View style={styles.communityInfoRow}>
                <Ionicons name="people" size={18} color="#4CAF50" />
                <Text style={styles.communityInfoLabel}>Familias:</Text>
                <Text style={styles.communityInfoValue}>{selectedCommunityData.familias}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Fecha y hora */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fecha y hora de entrega</Text>
          
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.dateTimeIconContainer}>
              <Ionicons name="calendar" size={22} color="#2196F3" />
            </View>
            <View style={styles.dateTimeTextContainer}>
              <Text style={styles.dateTimeLabel}>Fecha</Text>
              <Text style={styles.dateTimeValue}>
                {date.toLocaleDateString('es-MX', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <View style={styles.dateTimeIconContainer}>
              <Ionicons name="time" size={22} color="#FF9800" />
            </View>
            <View style={styles.dateTimeTextContainer}>
              <Text style={styles.dateTimeLabel}>Hora</Text>
              <Text style={styles.dateTimeValue}>
                {date.toLocaleTimeString('es-MX', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>
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

        {/* Voluntarios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Asignar voluntarios</Text>
          
          {volunteers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#E2E8F0" />
              <Text style={styles.emptyStateText}>No hay voluntarios disponibles</Text>
            </View>
          ) : (
            <View style={styles.volunteersGrid}>
              {volunteers.map((volunteer) => (
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
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    )}
                  </View>
                  <View style={styles.volunteerInfo}>
                    <Ionicons name="person-circle-outline" size={24} color="#718096" />
                    <Text style={styles.volunteerName}>
                      {volunteer.fullName || volunteer.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {volunteers.filter(v => v.selected).length > 0 && (
            <View style={styles.selectedCountBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.selectedCountText}>
                {volunteers.filter(v => v.selected).length} voluntario(s) seleccionado(s)
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
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.saveButtonText}>Programar entrega</Text>
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  templateInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    gap: 10,
  },
  templateInfoText: {
    flex: 1,
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "500",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 12,
  },
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
  communityInfoCard: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    gap: 8,
  },
  communityInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  communityInfoLabel: {
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "500",
  },
  communityInfoValue: {
    fontSize: 14,
    color: "#2D3748",
    fontWeight: "600",
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dateTimeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
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
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 15,
    color: "#2D3748",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  volunteersGrid: {
    gap: 10,
  },
  volunteerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F7FAFC",
  },
  volunteerSelected: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderColor: "#4CAF50",
  },
  volunteerCheckbox: {
    width: 24,
    height: 24,
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
  volunteerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  volunteerName: {
    fontSize: 16,
    color: "#2D3748",
    fontWeight: "500",
  },
  selectedCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    gap: 8,
  },
  selectedCountText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#A0AEC0",
    marginTop: 12,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53E3E",
    padding: 18,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 40,
    gap: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});