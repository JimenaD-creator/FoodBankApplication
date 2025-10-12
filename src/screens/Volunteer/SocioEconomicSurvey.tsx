import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Alert, TextInput } from "react-native";
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
const DIETARY_HABITS = ["Proteínas", "Fibra", "Ultraprocesados"];

export default function SocioNutritionalFormScreen({ navigation }: any) {
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
        userId: user.uid,
        ...formData,
        submittedAt: new Date(),
        status: "Pendiente de revisión"
      });

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
    if (step === 1) return formData.totalPersonas > 0;
    if (step === 2) return formData.tiposAlimentos.length > 0;
    return true;
  };

  // ---------------- STEP 1 ----------------
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Información del hogar</Text>
      <Text style={styles.stepSubtitle}>Cuéntanos sobre las personas que viven contigo</Text>

      {/* Total personas */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Cuántas personas viven en tu hogar?</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleNumberChange('totalPersonas', false)}>
            <Ionicons name="remove" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{formData.totalPersonas}</Text>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleNumberChange('totalPersonas', true)}>
            <Ionicons name="add" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Menores de edad */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Cuántos son menores de edad?</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleNumberChange('menoresEdad', false)}>
            <Ionicons name="remove" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{formData.menoresEdad}</Text>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleNumberChange('menoresEdad', true)}>
            <Ionicons name="add" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Adultos que trabajan */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Cuántos adultos trabajan actualmente?</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleNumberChange('adultosTrabajar', false)}>
            <Ionicons name="remove" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{formData.adultosTrabajar}</Text>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleNumberChange('adultosTrabajar', true)}>
            <Ionicons name="add" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Adultos mayores */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Cuántos adultos mayores (mayores de 60 años)?</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleNumberChange('adultosMayores', false)}>
            <Ionicons name="remove" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{formData.adultosMayores}</Text>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleNumberChange('adultosMayores', true)}>
            <Ionicons name="add" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Niños menores 5 */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Cuántos niños menores de 5 años?</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleNumberChange('niñosMenores5', false)}>
            <Ionicons name="remove" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{formData.niñosMenores5}</Text>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleNumberChange('niñosMenores5', true)}>
            <Ionicons name="add" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Personas con discapacidad */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Alguna persona en el hogar tiene discapacidad?</Text>
        <View style={styles.yesNoContainer}>
          <TouchableOpacity
            style={[styles.yesNoButton, formData.personasDiscapacidad === true && styles.yesNoButtonSelected]}
            onPress={() => setFormData({ ...formData, personasDiscapacidad: true })}
          >
            <Text style={[styles.yesNoText, formData.personasDiscapacidad === true && styles.yesNoTextSelected]}>Sí</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.yesNoButton, formData.personasDiscapacidad === false && styles.yesNoButtonSelected]}
            onPress={() => setFormData({ ...formData, personasDiscapacidad: false })}
          >
            <Text style={[styles.yesNoText, formData.personasDiscapacidad === false && styles.yesNoTextSelected]}>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Espacio cocina */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>Espacio disponible para cocinar/almacenar alimentos</Text>
        <View style={styles.optionsGrid}>
          {["Pequeño", "Mediano", "Grande"].map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, formData.espacioCocina === option && styles.optionButtonSelected]}
              onPress={() => setFormData({ ...formData, espacioCocina: option })}
            >
              <Text style={[styles.optionText, formData.espacioCocina === option && styles.optionTextSelected]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // ---------------- STEP 2 ----------------
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Situación alimentaria</Text>
      <Text style={styles.stepSubtitle}>Hábitos y frecuencia de consumo de alimentos</Text>

      {/* Tipos de alimentos */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Con qué frecuencia consumes los siguientes alimentos?</Text>
        {FOOD_TYPES.map(food => (
          <View key={food} style={styles.optionsGrid}>
            {FOOD_FREQUENCY.map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, formData.tiposAlimentos.includes(`${food}-${option}`) && styles.optionButtonSelected]}
                onPress={() => toggleArrayItem('tiposAlimentos', `${food}-${option}`)}
              >
                <Text style={[styles.optionText, formData.tiposAlimentos.includes(`${food}-${option}`) && styles.optionTextSelected]}>
                  {food} - {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Hábitos dietéticos */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Consumes regularmente estos alimentos?</Text>
        {DIETARY_HABITS.map(item => {
          const key = item.toLowerCase() as keyof typeof formData;
          return (
            <View key={item} style={styles.optionsGrid}>
              {FOOD_FREQUENCY.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionButton, formData[key] === option && styles.optionButtonSelected]}
                  onPress={() => setFormData({ ...formData, [key]: option })}
                >
                  <Text style={[styles.optionText, formData[key] === option && styles.optionTextSelected]}>
                    {item} - {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </View>

      {/* Dormir con hambre */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Alguna vez has dormido con hambre por falta de alimentos?</Text>
        <View style={styles.yesNoContainer}>
          <TouchableOpacity
            style={[styles.yesNoButton, formData.dormirConHambre === true && styles.yesNoButtonSelected]}
            onPress={() => setFormData({ ...formData, dormirConHambre: true })}
          >
            <Text style={[styles.yesNoText, formData.dormirConHambre === true && styles.yesNoTextSelected]}>Sí</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.yesNoButton, formData.dormirConHambre === false && styles.yesNoButtonSelected]}
            onPress={() => setFormData({ ...formData, dormirConHambre: false })}
          >
            <Text style={[styles.yesNoText, formData.dormirConHambre === false && styles.yesNoTextSelected]}>No</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ---------------- STEP 3 ----------------
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Salud y situación económica</Text>
      <Text style={styles.stepSubtitle}>Condiciones de salud y recursos del hogar</Text>

      {/* Condiciones de salud */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>¿Presenta alguna de las siguientes condiciones de salud?</Text>
        <View style={styles.optionsGrid}>
          {HEALTH_CONDITIONS.map(cond => (
            <TouchableOpacity
              key={cond}
              style={[styles.optionButton, formData.condicionesSalud.includes(cond) && styles.optionButtonSelected]}
              onPress={() => toggleArrayItem('condicionesSalud', cond)}
            >
              <Text style={[styles.optionText, formData.condicionesSalud.includes(cond) && styles.optionTextSelected]}>
                {cond}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Dieta especial */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>Dieta especial o restricciones alimentarias</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Describe aquí..."
          multiline
          value={formData.dietaEspecial}
          onChangeText={text => setFormData({ ...formData, dietaEspecial: text })}
        />
      </View>

      {/* Hospitalizaciones */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>Hospitalizaciones por temas de nutrición</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Describe aquí..."
          multiline
          value={formData.hospitalizacionesNutricion}
          onChangeText={text => setFormData({ ...formData, hospitalizacionesNutricion: text })}
        />
      </View>

      {/* Ingreso mensual */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>Ingreso mensual del hogar</Text>
        <View style={styles.optionsGrid}>
          {INCOME_RANGES.map(range => (
            <TouchableOpacity
              key={range}
              style={[styles.optionButton, formData.ingresoMensual === range && styles.optionButtonSelected]}
              onPress={() => setFormData({ ...formData, ingresoMensual: range })}
            >
              <Text style={[styles.optionText, formData.ingresoMensual === range && styles.optionTextSelected]}>{range}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Servicios básicos */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>Servicios básicos disponibles</Text>
        <View style={styles.optionsGrid}>
          {SERVICES.map(service => (
            <TouchableOpacity
              key={service}
              style={[styles.optionButton, formData.serviciosBasicos.includes(service) && styles.optionButtonSelected]}
              onPress={() => toggleArrayItem('serviciosBasicos', service)}
            >
              <Text style={[styles.optionText, formData.serviciosBasicos.includes(service) && styles.optionTextSelected]}>
                {service}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Fuentes de ingreso */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>Número de fuentes de ingreso en el hogar</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleNumberChange('fuentesIngreso', false)}>
            <Ionicons name="remove" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{formData.fuentesIngreso}</Text>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleNumberChange('fuentesIngreso', true)}>
            <Ionicons name="add" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Gastos en alimentos */}
      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>Gastos aproximados en alimentos por mes</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleNumberChange('gastosAlimentos', false)}>
            <Ionicons name="remove" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{formData.gastosAlimentos}</Text>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleNumberChange('gastosAlimentos', true)}>
            <Ionicons name="add" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground source={require('../../../assets/background.jpg')} style={styles.headerBackground} resizeMode="cover">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
                      <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Formulario Socio-Nutricional</Text>
        </View>
      </ImageBackground>

      {/* Contenido */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Navegación entre pasos */}
        <View style={styles.navigationContainer}>
          {step > 1 && (
            <TouchableOpacity style={styles.navButton} onPress={() => setStep(step - 1)}>
              <Text style={styles.navButtonText}>Anterior</Text>
            </TouchableOpacity>
          )}
          {step < 3 && (
            <TouchableOpacity
              style={[styles.navButton, !canContinue() && styles.navButtonDisabled]}
              disabled={!canContinue()}
              onPress={() => setStep(step + 1)}
            >
              <Text style={styles.navButtonText}>Siguiente</Text>
            </TouchableOpacity>
          )}
          {step === 3 && (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Enviar</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------- ESTILOS ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  headerBackground: { width: "100%", height: 120 },
  header: { flexDirection: "row", alignItems: "center", paddingTop: 40, paddingHorizontal: 16 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", marginLeft: 16 },

  stepContainer: { marginBottom: 20 },
  stepTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  stepSubtitle: { fontSize: 16, marginBottom: 16 },

  questionBlock: { marginBottom: 20 },
  questionLabel: { fontSize: 16, marginBottom: 8, fontWeight: "600" },
  counterContainer: { flexDirection: "row", alignItems: "center" },
  counterButton: { padding: 8, backgroundColor: "#ddd", borderRadius: 6, marginHorizontal: 10 },
  counterValue: { fontSize: 18, fontWeight: "bold" },

  yesNoContainer: { flexDirection: "row", gap: 12 },
  yesNoButton: { padding: 10, borderWidth: 1, borderColor: "#aaa", borderRadius: 6 },
  yesNoButtonSelected: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  yesNoText: { color: "#000" },
  yesNoTextSelected: { color: "#fff", fontWeight: "bold" },

  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionButton: { padding: 8, borderWidth: 1, borderColor: "#aaa", borderRadius: 6 },
  optionButtonSelected: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  optionText: { color: "#000", fontSize: 14 },
  optionTextSelected: { color: "#fff", fontWeight: "bold" },

  textInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10, minHeight: 60, backgroundColor: "#fff" },

  navigationContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  navButton: { backgroundColor: "", padding: 12, borderRadius: 6 },
  navButtonDisabled: { backgroundColor: "#4CAF50" },
  navButtonText: { color: "#fff", fontWeight: "bold" },
  submitButton: { flex: 1, backgroundColor: "#4CAF50", padding: 12, borderRadius: 6, alignItems: "center" },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
