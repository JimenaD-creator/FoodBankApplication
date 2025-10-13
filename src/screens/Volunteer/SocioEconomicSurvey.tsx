import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import { saveSecureData, getSecureData } from "../../services/secureStorage";
import NetInfo from "@react-native-community/netinfo";
import { secureFetch } from "../../services/networkSecurity";

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
  const [isConnected, setIsConnected] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs(prev => [msg, ...prev]);
  };

  // ------------------ Conexión ------------------
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
      addLog(`[NetInfo] Conectado: ${state.isConnected}`);
    });
    return () => unsubscribe();
  }, []);

  // ------------------ Cargar draft ------------------
  useEffect(() => {
  (async () => {
    const stored = await getSecureData("socioFormDraft");
    if (!stored) {
      addLog("[Draft] No hay datos guardados todavía en SecureStore.");
    } else {
      // Mostrar alerta para que el usuario decida
      Alert.alert(
        "Draft encontrado",
        "Se han encontrado datos guardados. ¿Deseas cargarlos o iniciar uno nuevo?",
        [
          { 
            text: "Nuevo", 
            onPress: () => addLog("[Draft] Usuario inicia formulario nuevo") 
          },
          { 
            text: "Cargar", 
            onPress: () => {
              setFormData(JSON.parse(stored));
              addLog("[Draft] Formulario cargado desde SecureStore (sin disparar logs de campo individual)");
            } 
          },
        ]
      );
    }
  })();
}, []);


  // ------------------ Cambios en números ------------------
  const handleNumberChange = (field: string, increment: boolean) => {
    setFormData(prev => {
      const newValue = Math.max(0, (prev[field as keyof typeof prev] as number) + (increment ? 1 : -1));
      addLog(`[FormData] Campo ${field} cambiado a ${newValue}`);
      return { ...prev, [field]: newValue };
    });
  };

  // ------------------ Toggle arrays ------------------
  const toggleArrayItem = (field: string, item: string) => {
    setFormData(prev => {
      const array = prev[field as keyof typeof prev] as string[];
      const newArray = array.includes(item)
        ? array.filter(i => i !== item)
        : [...array, item];
      addLog(`[FormData] Campo ${field} actualizado: ${JSON.stringify(newArray)}`);
      return { ...prev, [field]: newArray };
    });
  };

  // ------------------ Submit ------------------
  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "Debes iniciar sesión");
        addLog("[Form] Usuario no logueado");
        return;
      }

      // Guardar en SecureStore siempre para evidencia
      await saveSecureData("socioFormDraft", JSON.stringify(formData));
      addLog("[EncryptionTest] ✅ Contenido guardado en SecureStore: " + JSON.stringify(formData));
      Alert.alert("SecureStore Test", "Datos guardados correctamente ✅");

      if (!isConnected) {
        addLog("[Form] Guardado local en SecureStore (offline)");
        Alert.alert(
          "Sin conexión",
          "No hay internet, el formulario fue guardado de forma segura y se sincronizará automáticamente al reconectarse."
        );
        return;
      }

      // Validación HTTPS simulada (mitigación M5)
    const firebaseEndpoint = "https://firestore.googleapis.com/v1/projects/foodbankapplication/databases/(default)/documents";
    await secureFetch(firebaseEndpoint, { method: "GET" }, addLog);

    addLog("[Seguridad] Validación HTTPS/TLS completada exitosamente");

     // Después de enviar a Firebase
    await addDoc(collection(db, "socioNutritionalForms"), {
      userId: user.uid,
      ...formData,
      submittedAt: new Date(),
      status: "Pendiente de revisión",
    });

    // Borrar draft
    await saveSecureData("socioFormDraft", "");
    addLog("[Draft] Draft borrado después de enviar formulario");


// Borrar draft
await saveSecureData("socioFormDraft", "");
addLog("[Draft] Draft borrado después de enviar formulario");

      addLog("[Form] Formulario enviado a Firebase correctamente");
      Alert.alert("Formulario enviado", "Tu solicitud ha sido enviada exitosamente.");
      navigation.goBack();
    } catch (error) {
      if(error instanceof Error){
        console.error("Error detallado:", error);
      addLog("[Form]Error enviando formulario: " + (error.message || JSON.stringify(error)));
      Alert.alert("Error", "No se pudo enviar el formulario.\n\n" + (error.message || "Revisa los logs para más detalles."));
      }else{
        console.log("Ocurrió un error desconocido", error);
      }
      
    }
  };

  const canContinue = () => {
    if (step === 1) return formData.totalPersonas > 0;
    if (step === 2) return formData.tiposAlimentos.length > 0;
    return true;
  };

  // ------------------ Renders de pasos ------------------
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
            onPress={() => { setFormData({ ...formData, personasDiscapacidad: true }); addLog("[FormData] personasDiscapacidad = true") }}
          >
            <Text style={[styles.yesNoText, formData.personasDiscapacidad === true && styles.yesNoTextSelected]}>Sí</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.yesNoButton, formData.personasDiscapacidad === false && styles.yesNoButtonSelected]}
            onPress={() => { setFormData({ ...formData, personasDiscapacidad: false }); addLog("[FormData] personasDiscapacidad = false") }}
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
              onPress={() => { setFormData({ ...formData, espacioCocina: option }); addLog(`[FormData] espacioCocina = ${option}`) }}
            >
              <Text style={[styles.optionText, formData.espacioCocina === option && styles.optionTextSelected]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // ------------------ STEP 2 ------------------
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
                  onPress={() => { setFormData({ ...formData, [key]: option }); addLog(`[FormData] ${key} = ${option}`) }}
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
            onPress={() => { setFormData({ ...formData, dormirConHambre: true }); addLog("[FormData] dormirConHambre = true") }}
          >
            <Text style={[styles.yesNoText, formData.dormirConHambre === true && styles.yesNoTextSelected]}>Sí</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.yesNoButton, formData.dormirConHambre === false && styles.yesNoButtonSelected]}
            onPress={() => { setFormData({ ...formData, dormirConHambre: false }); addLog("[FormData] dormirConHambre = false") }}
          >
            <Text style={[styles.yesNoText, formData.dormirConHambre === false && styles.yesNoTextSelected]}>No</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ------------------ STEP 3 ------------------
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
          onChangeText={text => { setFormData({ ...formData, dietaEspecial: text }); }}
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
          onChangeText={text => { setFormData({ ...formData, hospitalizacionesNutricion: text });  }}
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
              onPress={() => { setFormData({ ...formData, ingresoMensual: range });  }}
            >
              <Text style={[styles.optionText, formData.ingresoMensual === range && styles.optionTextSelected]}>{range}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // ------------------ Render ------------------
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {/* Navegación */}
      <View style={styles.navigationContainer}>
        {step > 1 && (
          <TouchableOpacity style={styles.navButton} onPress={() => setStep(step - 1)}>
            <Text style={styles.navButtonText}>Anterior</Text>
          </TouchableOpacity>
        )}
        {step < 3 && (
          <TouchableOpacity style={[styles.navButton, !canContinue() && styles.navButtonDisabled]} onPress={() => canContinue() && setStep(step + 1)}>
            <Text style={styles.navButtonText}>Siguiente</Text>
          </TouchableOpacity>
        )}
        {step === 3 && (
          <TouchableOpacity style={styles.navButton} onPress={handleSubmit}>
            <Text style={styles.navButtonText}>Enviar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Logs */}
      <View style={styles.logContainer}>
        {logs.map((log, i) => (
          <Text key={i} style={styles.logText}>{log}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f7f7f7" },
  stepContainer: { marginBottom: 30, backgroundColor: "#fff", padding: 20, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  stepTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 5, color: "#222" },
  stepSubtitle: { fontSize: 14, color: "#666", marginBottom: 15 },
  questionBlock: { marginBottom: 20 },
  questionLabel: { fontSize: 16, marginBottom: 8, color: "#333" },
  counterContainer: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  counterButton: { padding: 10, borderWidth: 1, borderRadius: 8, marginHorizontal: 10, borderColor: "#ccc", backgroundColor: "#fff" },
  counterValue: { fontSize: 18, fontWeight: "bold", minWidth: 35, textAlign: "center" },
  yesNoContainer: { flexDirection: "row", marginTop: 5 },
  yesNoButton: { flex: 1, padding: 12, borderWidth: 1, borderRadius: 8, marginHorizontal: 5, borderColor: "#ccc", backgroundColor: "#fff" },
  yesNoButtonSelected: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  yesNoText: { textAlign: "center", color: "#333", fontWeight: "500" },
  yesNoTextSelected: { color: "#fff", fontWeight: "bold" },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  optionButton: { paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8, margin: 5, borderColor: "#ccc", backgroundColor: "#fff" },
  optionButtonSelected: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  optionText: { fontSize: 14, color: "#333" },
  optionTextSelected: { color: "#fff", fontWeight: "bold" },
  textInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, minHeight: 60, backgroundColor: "#fff", textAlignVertical: "top" },
  navigationContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  navButton: { flex: 1, backgroundColor: "#4CAF50", padding: 14, borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
  navButtonDisabled: { backgroundColor: "#aaa" },
  navButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  logContainer: { marginTop: 20, borderTopWidth: 1, borderTopColor: "#ccc", paddingTop: 10 },
  logText: { fontSize: 12, color: "#333" }
});

