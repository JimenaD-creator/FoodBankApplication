import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";

const FOOD_FREQUENCY = ["Siempre", "A veces", "Rara vez", "Nunca"];
const INCOME_RANGES = ["Menos de $3,000", "$3,000 - $6,000", "$6,000 - $10,000", "Más de $10,000"];
const FOOD_TYPES = ["Verduras", "Frutas", "Carnes", "Lácteos", "Cereales", "Legumbres"];
const SERVICES = ["Agua", "Luz", "Drenaje", "Gas"];
const HEALTH_CONDITIONS = [
  "Diabetes",
  "Hipertensión",
  "Discapacidad",
  "Embarazo",
  "Desnutrición infantil",
  "Ninguna"
];

export default function SocioNutritionalFormScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Información del hogar
    totalPersonas: 0,
    menoresEdad: 0,
    adultosTrabajar: 0,

    // Situación alimentaria
    frecuenciaComidas: "",
    faltaAlimentos: false,
    tiposAlimentos: [] as string[],

    // Condiciones de salud
    condicionesSalud: [] as string[],
    detallesCondiciones: "",

    // Situación económica
    ingresoMensual: "",
    serviciosBasicos: [] as string[],
  });

  const handleNumberChange = (field: string, increment: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: Math.max(0, prev[field as keyof typeof prev] as number + (increment ? 1 : -1))
    }));
  };

  const toggleArrayItem = (field: string, item: string) => {
    setFormData(prev => {
      const array = prev[field as keyof typeof prev] as string[];
      const newArray = array.includes(item)
        ? array.filter(i => i !== item)
        : [...array, item];
      return { ...prev, [field]: newArray };
    });
  };

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "Debes iniciar sesión");
        return;
      }

      // Guardar formulario
      await addDoc(collection(db, "socioNutritionalForms"), {
        userId: user.uid,
        ...formData,
        submittedAt: new Date(),
        status: "Pendiente de revisión"
      });

      // Actualizar estado del usuario
      await updateDoc(doc(db, "users", user.uid), {
        formSubmitted: true,
        status: "Evaluación"
      });

      Alert.alert(
        "Formulario enviado",
        "Tu solicitud ha sido enviada. Recibirás una notificación cuando sea revisada.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Error guardando formulario:", error);
      Alert.alert("Error", "No se pudo enviar el formulario");
    }
  };

  const canContinue = () => {
    if (step === 1) {
      return formData.totalPersonas > 0;
    }
    if (step === 2) {
      return formData.frecuenciaComidas !== "" && formData.tiposAlimentos.length > 0;
    }
    return true;
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Información del hogar</Text>
      <Text style={styles.stepSubtitle}>
        Cuéntanos sobre las personas que viven contigo
      </Text>

      {/* Total de personas */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Cuántas personas viven en tu hogar?</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => handleNumberChange('totalPersonas', false)}
          >
            <Ionicons name="remove" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{formData.totalPersonas}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => handleNumberChange('totalPersonas', true)}
          >
            <Ionicons name="add" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Menores de edad */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Cuántos son menores de edad?</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => handleNumberChange('menoresEdad', false)}
          >
            <Ionicons name="remove" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{formData.menoresEdad}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => handleNumberChange('menoresEdad', true)}
          >
            <Ionicons name="add" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Adultos que trabajan */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Cuántos adultos trabajan actualmente?</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => handleNumberChange('adultosTrabajar', false)}
          >
            <Ionicons name="remove" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{formData.adultosTrabajar}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => handleNumberChange('adultosTrabajar', true)}
          >
            <Ionicons name="add" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Situación alimentaria</Text>
      <Text style={styles.stepSubtitle}>
        Ayúdanos a entender tu acceso a alimentos
      </Text>

      {/* Frecuencia de comidas */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Con qué frecuencia consumes 3 comidas al día?</Text>
        <View style={styles.optionsGrid}>
          {FOOD_FREQUENCY.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                formData.frecuenciaComidas === option && styles.optionButtonSelected
              ]}
              onPress={() => setFormData({ ...formData, frecuenciaComidas: option })}
            >
              <Text style={[
                styles.optionText,
                formData.frecuenciaComidas === option && styles.optionTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Falta de alimentos */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>
          En el último mes, ¿te has quedado sin alimentos por falta de dinero?
        </Text>
        <View style={styles.yesNoContainer}>
          <TouchableOpacity
            style={[
              styles.yesNoButton,
              formData.faltaAlimentos === true && styles.yesNoButtonSelected
            ]}
            onPress={() => setFormData({ ...formData, faltaAlimentos: true })}
          >
            <Text style={[
              styles.yesNoText,
              formData.faltaAlimentos === true && styles.yesNoTextSelected
            ]}>
              Sí
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.yesNoButton,
              formData.faltaAlimentos === false && styles.yesNoButtonSelected
            ]}
            onPress={() => setFormData({ ...formData, faltaAlimentos: false })}
          >
            <Text style={[
              styles.yesNoText,
              formData.faltaAlimentos === false && styles.yesNoTextSelected
            ]}>
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tipos de alimentos */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>
          ¿Qué tipos de alimentos consumes con mayor frecuencia?
        </Text>
        <Text style={styles.questionHint}>Puedes seleccionar varios</Text>
        <View style={styles.checkboxGrid}>
          {FOOD_TYPES.map((food) => (
            <TouchableOpacity
              key={food}
              style={[
                styles.checkboxItem,
                formData.tiposAlimentos.includes(food) && styles.checkboxItemSelected
              ]}
              onPress={() => toggleArrayItem('tiposAlimentos', food)}
            >
              <View style={[
                styles.checkbox,
                formData.tiposAlimentos.includes(food) && styles.checkboxChecked
              ]}>
                {formData.tiposAlimentos.includes(food) && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>{food}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Información adicional</Text>
      <Text style={styles.stepSubtitle}>
        Últimas preguntas para completar tu solicitud
      </Text>

      {/* Condiciones de salud */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>
          ¿Algún miembro del hogar tiene condiciones especiales de salud?
        </Text>
        <Text style={styles.questionHint}>Puedes seleccionar varias</Text>
        <View style={styles.checkboxGrid}>
          {HEALTH_CONDITIONS.map((condition) => (
            <TouchableOpacity
              key={condition}
              style={[
                styles.checkboxItem,
                formData.condicionesSalud.includes(condition) && styles.checkboxItemSelected
              ]}
              onPress={() => toggleArrayItem('condicionesSalud', condition)}
            >
              <View style={[
                styles.checkbox,
                formData.condicionesSalud.includes(condition) && styles.checkboxChecked
              ]}>
                {formData.condicionesSalud.includes(condition) && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>{condition}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Ingreso mensual */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>
          ¿Cuál es el ingreso mensual aproximado del hogar?
        </Text>
        <View style={styles.optionsGrid}>
          {INCOME_RANGES.map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.optionButton,
                formData.ingresoMensual === range && styles.optionButtonSelected
              ]}
              onPress={() => setFormData({ ...formData, ingresoMensual: range })}
            >
              <Text style={[
                styles.optionText,
                formData.ingresoMensual === range && styles.optionTextSelected
              ]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Servicios básicos */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Con qué servicios básicos cuentas?</Text>
        <View style={styles.servicesGrid}>
          {SERVICES.map((service) => (
            <TouchableOpacity
              key={service}
              style={[
                styles.serviceCard,
                formData.serviciosBasicos.includes(service) && styles.serviceCardSelected
              ]}
              onPress={() => toggleArrayItem('serviciosBasicos', service)}
            >
              <View style={[
                styles.serviceIcon,
                formData.serviciosBasicos.includes(service) && styles.serviceIconSelected
              ]}>
                <Ionicons
                  name={
                    service === "Agua" ? "water" :
                    service === "Luz" ? "flash" :
                    service === "Drenaje" ? "git-network" : "flame"
                  }
                  size={24}
                  color={formData.serviciosBasicos.includes(service) ? "#fff" : "#4CAF50"}
                />
              </View>
              <Text style={[
                styles.serviceText,
                formData.serviciosBasicos.includes(service) && styles.serviceTextSelected
              ]}>
                {service}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground 
        source={require('../../assets/background.png')}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            if (step > 1) {
              setStep(step - 1);
            } else {
              navigation.goBack();
            }
          }}>
            <Ionicons name="arrow-back" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Formulario de Evaluación</Text>
          <View style={{ width: 24 }} />
        </View>
      </ImageBackground>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Paso {step} de 3</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navigationContainer}>
        {step < 3 ? (
          <TouchableOpacity
            style={[styles.nextButton, !canContinue() && styles.nextButtonDisabled]}
            onPress={() => setStep(step + 1)}
            disabled={!canContinue()}
          >
            <Text style={styles.nextButtonText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>Enviar formulario</Text>
          </TouchableOpacity>
        )}
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E53E3E",
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#718096",
    textAlign: "center",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 24,
  },
  questionBlock: {
    marginBottom: 28,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 12,
    lineHeight: 22,
  },
  questionHint: {
    fontSize: 13,
    color: "#A0AEC0",
    marginBottom: 12,
    fontStyle: "italic",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    padding: 20,
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  counterValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D3748",
    marginHorizontal: 40,
    minWidth: 50,
    textAlign: "center",
  },
  optionsGrid: {
    gap: 10,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F7FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  optionButtonSelected: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
  optionText: {
    fontSize: 15,
    color: "#4A5568",
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  yesNoContainer: {
    flexDirection: "row",
    gap: 12,
  },
  yesNoButton: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#F7FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  yesNoButtonSelected: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
  yesNoText: {
    fontSize: 18,
    color: "#4A5568",
    fontWeight: "600",
  },
  yesNoTextSelected: {
    color: "#4CAF50",
  },
  checkboxGrid: {
    gap: 10,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  checkboxItemSelected: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CBD5E0",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkboxLabel: {
    fontSize: 15,
    color: "#2D3748",
    fontWeight: "500",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  serviceCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F7FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  serviceCardSelected: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceIconSelected: {
    backgroundColor: "#4CAF50",
  },
  serviceText: {
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "500",
  },
  serviceTextSelected: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  navigationContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#fff",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: "#CBD5E0",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53E3E",
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});