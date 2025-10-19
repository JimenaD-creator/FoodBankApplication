import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ImageBackground, 
  Alert, 
  TextInput,
  Dimensions 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import { useRoute, RouteProp  } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
const DIETARY_HABITS = ["Proteínas", "Fibra", "Ultraprocesados"];

type RootStackParamList = {
  SocioNutritionalFormScreen: { origin: string }
};

type SocioNutritionalFormScreenRouteProp = RouteProp<RootStackParamList, 'SocioNutritionalFormScreen'>;

export default function SocioNutritionalFormScreen({ navigation }: any) {
  const route = useRoute<SocioNutritionalFormScreenRouteProp>();
  const { origin } = route.params;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    totalPersonas: 0,
    menoresEdad: 0,
    adultosTrabajar: 0,
    adultosMayores: 0,
    niñosMenores5: 0,
    personasDiscapacidad: false,
    espacioCocina: "",
    frecuenciaComidas: "",
    faltaAlimentos: false,
    tiposAlimentos: [] as string[],
    consumoProteínas: "",
    consumoFibra: "",
    ultraprocesados: "",
    dormirConHambre: false,
    condicionesSalud: [] as string[],
    dietaEspecial: "",
    hospitalizacionesNutricion: "",
    detallesCondiciones: "",
    ingresoMensual: "",
    serviciosBasicos: [] as string[],
    fuentesIngreso: 0,
    gastosAlimentos: 0,
  });

  const [validation, setValidation] = useState<boolean | null>(null);

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

      await addDoc(collection(db, "socioNutritionalForms"), {
        beneficiaryId: origin,
        userId: user.uid,
        ...formData,
        submittedAt: new Date(),
        status: "Pendiente de revisión"
      });

      await updateDoc(doc(db, "users", user.uid), {
        formSubmitted: true,
        status: "Evaluación"
      });

      setStep(4);
      
      Alert.alert(
        "✅ Formulario Enviado",
        "Tu información ha sido guardada exitosamente. Ahora puedes proceder con la validación.",
        [{ text: "Continuar", style: "default" }]
      );

    } catch (error) {
      console.error("Error guardando formulario:", error);
      Alert.alert("❌ Error", "No se pudo enviar el formulario. Intenta nuevamente.");
    }
  };

  const handleValidation = async () => {
    if (validation === null) {
      Alert.alert("Selección requerida", "Por favor selecciona Sí o No para continuar.");
      return;
    }

    try {
      const deliveryRef = doc(db, "users", origin);
      await updateDoc(deliveryRef, { status: "Aprobado" });
      Alert.alert('✅ Éxito', 'El estado del beneficiario ha sido actualizado correctamente.');
      navigation.goBack();
    } catch (error) {
      Alert.alert("❌ Error", "No se pudo actualizar el estado en la base de datos.");
    }
  };

  const canContinue = () => {
    if (step === 1) return formData.totalPersonas > 0;
    if (step === 2) return formData.tiposAlimentos.length > 0;
    return true;
  };

  const StepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3, 4].map((stepNumber) => (
        <View key={stepNumber} style={styles.stepRow}>
          <View style={[
            styles.stepCircle,
            step === stepNumber && styles.stepCircleActive,
            step > stepNumber && styles.stepCircleCompleted
          ]}>
            {step > stepNumber ? (
              <Ionicons name="checkmark" size={16} color="#fff" />
            ) : (
              <Text style={[
                styles.stepNumber,
                (step === stepNumber || step > stepNumber) && styles.stepNumberActive
              ]}>
                {stepNumber}
              </Text>
            )}
          </View>
          {stepNumber < 4 && (
            <View style={[
              styles.stepLine,
              step > stepNumber && styles.stepLineCompleted
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  // ---------------- STEP 1 ----------------
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="people" size={32} color="#4CAF50" />
        <View style={styles.stepTextContainer}>
          <Text style={styles.stepTitle}>Información del Hogar</Text>
          <Text style={styles.stepSubtitle}>Cuéntanos sobre las personas que viven contigo</Text>
        </View>
      </View>

      {[
        { label: "¿Cuántas personas viven en tu hogar?", field: 'totalPersonas' },
        { label: "¿Cuántos son menores de edad?", field: 'menoresEdad' },
        { label: "¿Cuántos adultos trabajan actualmente?", field: 'adultosTrabajar' },
        { label: "¿Cuántos adultos mayores (mayores de 60 años)?", field: 'adultosMayores' },
        { label: "¿Cuántos niños menores de 5 años?", field: 'niñosMenores5' },
      ].map((item, index) => (
        <View key={index} style={styles.questionBlock}>
          <Text style={styles.questionLabel}>{item.label}</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity 
              style={styles.counterButton} 
              onPress={() => handleNumberChange(item.field, false)}
            >
              <Ionicons name="remove" size={20} color="#E53E3E" />
            </TouchableOpacity>
            <View style={styles.counterValueContainer}>
              <Text style={styles.counterValue}>{formData[item.field as keyof typeof formData] as number}</Text>
            </View>
            <TouchableOpacity 
              style={styles.counterButton} 
              onPress={() => handleNumberChange(item.field, true)}
            >
              <Ionicons name="add" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Alguna persona en el hogar tiene discapacidad?</Text>
        <View style={styles.yesNoContainer}>
          {[
            { label: "Sí", value: true },
            { label: "No", value: false }
          ].map((option) => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.yesNoButton,
                formData.personasDiscapacidad === option.value && styles.yesNoButtonSelected
              ]}
              onPress={() => setFormData({ ...formData, personasDiscapacidad: option.value })}
            >
              <Text style={[
                styles.yesNoText,
                formData.personasDiscapacidad === option.value && styles.yesNoTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>Espacio disponible para cocinar/almacenar alimentos</Text>
        <View style={styles.optionsGrid}>
          {["Pequeño", "Mediano", "Grande"].map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                formData.espacioCocina === option && styles.optionButtonSelected
              ]}
              onPress={() => setFormData({ ...formData, espacioCocina: option })}
            >
              <Text style={[
                styles.optionText,
                formData.espacioCocina === option && styles.optionTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // ---------------- STEP 2 ----------------
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="restaurant" size={32} color="#FF9800" />
        <View style={styles.stepTextContainer}>
          <Text style={styles.stepTitle}>Situación Alimentaria</Text>
          <Text style={styles.stepSubtitle}>Hábitos y frecuencia de consumo de alimentos</Text>
        </View>
      </View>

      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Con qué frecuencia consumes los siguientes alimentos?</Text>
        {FOOD_TYPES.map(food => (
          <View key={food} style={styles.foodTypeSection}>
            <Text style={styles.foodTypeLabel}>{food}</Text>
            <View style={styles.frequencyGrid}>
              {FOOD_FREQUENCY.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.frequencyButton,
                    formData.tiposAlimentos.includes(`${food}-${option}`) && styles.frequencyButtonSelected
                  ]}
                  onPress={() => toggleArrayItem('tiposAlimentos', `${food}-${option}`)}
                >
                  <Text style={[
                    styles.frequencyText,
                    formData.tiposAlimentos.includes(`${food}-${option}`) && styles.frequencyTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Alguna vez has dormido con hambre por falta de alimentos?</Text>
        <View style={styles.yesNoContainer}>
          {[
            { label: "Sí", value: true },
            { label: "No", value: false }
          ].map((option) => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.yesNoButton,
                formData.dormirConHambre === option.value && styles.yesNoButtonSelected
              ]}
              onPress={() => setFormData({ ...formData, dormirConHambre: option.value })}
            >
              <Text style={[
                styles.yesNoText,
                formData.dormirConHambre === option.value && styles.yesNoTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // ---------------- STEP 3 ----------------
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="medkit" size={32} color="#2196F3" />
        <View style={styles.stepTextContainer}>
          <Text style={styles.stepTitle}>Salud y Economía</Text>
          <Text style={styles.stepSubtitle}>Condiciones de salud y recursos del hogar</Text>
        </View>
      </View>

      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Presenta alguna de las siguientes condiciones de salud?</Text>
        <View style={styles.healthGrid}>
          {HEALTH_CONDITIONS.map(cond => (
            <TouchableOpacity
              key={cond}
              style={[
                styles.healthButton,
                formData.condicionesSalud.includes(cond) && styles.healthButtonSelected
              ]}
              onPress={() => toggleArrayItem('condicionesSalud', cond)}
            >
              <Text style={[
                styles.healthText,
                formData.condicionesSalud.includes(cond) && styles.healthTextSelected
              ]}>
                {cond}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>Dieta especial o restricciones alimentarias</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Describe aquí cualquier dieta especial o restricción alimentaria..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
          value={formData.dietaEspecial}
          onChangeText={text => setFormData({ ...formData, dietaEspecial: text })}
        />
      </View>

      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>Ingreso mensual del hogar</Text>
        <View style={styles.incomeGrid}>
          {INCOME_RANGES.map(range => (
            <TouchableOpacity
              key={range}
              style={[
                styles.incomeButton,
                formData.ingresoMensual === range && styles.incomeButtonSelected
              ]}
              onPress={() => setFormData({ ...formData, ingresoMensual: range })}
            >
              <Text style={[
                styles.incomeText,
                formData.ingresoMensual === range && styles.incomeTextSelected
              ]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // ---------------- STEP 4 ----------------
  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="checkmark-circle" size={32} color="#10B981" />
        <View style={styles.stepTextContainer}>
          <Text style={styles.stepTitle}>Validación Final</Text>
          <Text style={styles.stepSubtitle}>Confirmación del beneficiario</Text>
        </View>
      </View>

      <View style={styles.validationContainer}>
        <View style={styles.validationCard}>
          <Ionicons name="shield-checkmark" size={48} color="#10B981" />
          <Text style={styles.validationTitle}>¿Validar Beneficiario?</Text>
          <Text style={styles.validationSubtitle}>
            Basado en la información proporcionada, ¿desea aprobar a este usuario como beneficiario?
          </Text>
          
          <View style={styles.validationButtonsContainer}>
            {[
              { label: "Sí, Aprobar", value: true, color: "#10B981" },
              { label: "No, Rechazar", value: false, color: "#EF4444" }
            ].map((option) => (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.validationButton,
                  { backgroundColor: option.color },
                  validation === option.value && styles.validationButtonSelected
                ]}
                onPress={() => setValidation(option.value)}
              >
                <Text style={styles.validationButtonText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
        <View style={styles.headerOverlay}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Formulario Socio-Nutricional</Text>
              <Text style={styles.headerSubtitle}>Paso {step} de 4</Text>
            </View>
            <View style={styles.headerPlaceholder} />
          </View>
        </View>
      </ImageBackground>

      {/* Step Indicator */}
      <View style={styles.stepIndicatorWrapper}>
        <StepIndicator />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {step > 1 && step !== 4 && (
            <TouchableOpacity 
              style={[styles.navButton, styles.navButtonSecondary]}
              onPress={() => setStep(step - 1)}
            >
              <Ionicons name="arrow-back" size={20} color="#6B7280" />
              <Text style={styles.navButtonSecondaryText}>Anterior</Text>
            </TouchableOpacity>
          )}
          
          {step < 3 && (
            <TouchableOpacity
              style={[styles.navButton, !canContinue() && styles.navButtonDisabled]}
              disabled={!canContinue()}
              onPress={() => setStep(step + 1)}
            >
              <Text style={styles.navButtonText}>Siguiente</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          
          {step === 3 && (
            <TouchableOpacity 
              style={[styles.navButton, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.navButtonText}>Enviar Información</Text>
            </TouchableOpacity>
          )}
          
          {step === 4 && (
            <TouchableOpacity 
              style={[styles.navButton, styles.submitButton, validation === null && styles.navButtonDisabled]}
              disabled={validation === null}
              onPress={handleValidation}
            >
              <Ionicons name="checkmark-done" size={20} color="#fff" />
              <Text style={styles.navButtonText}>Concluir Formulario</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------- ESTILOS MEJORADOS ----------------
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },
  headerBackground: { 
    width: "100%", 
    height: 160 
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: "rgba(229, 62, 62, 0.9)",
    justifyContent: "flex-end",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
  },
  headerPlaceholder: {
    width: 40,
  },
  stepIndicatorWrapper: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    backgroundColor: "#4CAF50",
  },
  stepCircleCompleted: {
    backgroundColor: "#10B981",
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  stepNumberActive: {
    color: "#fff",
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  stepLineCompleted: {
    backgroundColor: "#10B981",
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  questionBlock: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: 200,
    alignSelf: "center",
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  counterValueContainer: {
    minWidth: 60,
    alignItems: "center",
  },
  counterValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  yesNoContainer: {
    flexDirection: "row",
    gap: 12,
  },
  yesNoButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  yesNoButtonSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  yesNoText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  yesNoTextSelected: {
    color: "#fff",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - 80) / 3,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionButtonSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
  optionTextSelected: {
    color: "#fff",
  },
  foodTypeSection: {
    marginBottom: 16,
  },
  foodTypeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  frequencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - 80) / 4,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  frequencyButtonSelected: {
    backgroundColor: "#FF9800",
    borderColor: "#FF9800",
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
  frequencyTextSelected: {
    color: "#fff",
  },
  healthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  healthButton: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - 80) / 2,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  healthButtonSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  healthText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
  healthTextSelected: {
    color: "#fff",
  },
  incomeGrid: {
    gap: 8,
  },
  incomeButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "transparent",
  },
  incomeButtonSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  incomeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
  incomeTextSelected: {
    color: "#fff",
  },
  textInput: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#374151",
    textAlignVertical: "top",
    minHeight: 100,
  },
  validationContainer: {
    alignItems: "center",
  },
  validationCard: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    width: "100%",
  },
  validationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  validationSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  validationButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  validationButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    opacity: 0.8,
  },
  validationButtonSelected: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
  validationButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    gap: 8,
  },
  navButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  navButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
  },
  navButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  navButtonSecondaryText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#10B981",
  },
});