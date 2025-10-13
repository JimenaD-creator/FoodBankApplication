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

export default function PreStudyForm({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [showConsentModal, setShowConsentModal] = useState(true);
  const [showFinalConsentModal, setShowFinalConsentModal] = useState(false);
  const [consentCompleted, setConsentCompleted] = useState(false);
  const [securityTestResults, setSecurityTestResults] = useState<string[]>([]);
  const [showSecurityTest, setShowSecurityTest] = useState(false);
  const [userConsents, setUserConsents] = useState({
    householdInfo: true,
    foodSecurity: true,
    healthConditions: false,
    incomeData: false,
    servicesInfo: false
  });
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

  const handleConsentComplete = () => {
    setConsentCompleted(true);
    setShowConsentModal(false);
  };

  const handleFirstSubmit = async () => {
    setShowFinalConsentModal(true);
  };

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "Debes iniciar sesión");
        return;
      }

      // Validar consentimientos requeridos
      if (!userConsents.householdInfo || !userConsents.foodSecurity) {
        Alert.alert(
          "Consentimiento Requerido",
          "Debes aceptar los consentimientos obligatorios para enviar el formulario."
        );
        return;
      }

      // Crear objeto con datos minimizados según consentimiento
      const minimizedData = {
        userId: user.uid,
        // Datos siempre incluidos (consentimiento implícito)
        household: {
          totalPersonas: formData.totalPersonas,
          menoresEdad: formData.menoresEdad
        },
        foodSecurity: {
          frecuenciaComidas: formData.frecuenciaComidas,
          faltaAlimentos: formData.faltaAlimentos,
          tiposAlimentos: formData.tiposAlimentos
        },
        // Datos condicionales por consentimiento
        ...(userConsents.healthConditions && {
          healthConditions: {
            condicionesSalud: formData.condicionesSalud,
            detallesCondiciones: formData.detallesCondiciones
          }
        }),
        ...(userConsents.incomeData && {
          economicSituation: {
            ingresoMensual: formData.ingresoMensual,
            adultosTrabajar: formData.adultosTrabajar
          }
        }),
        ...(userConsents.servicesInfo && {
          basicServices: formData.serviciosBasicos
        }),
        // Metadatos
        consents: userConsents,
        consentTimestamp: new Date(),
        submittedAt: new Date(),
        status: "Pendiente de revisión"
      };

      // Guardar formulario minimizado
      await addDoc(collection(db, "pre_socioNutritionalForms"), minimizedData);

      // Registrar consentimiento
      await addDoc(collection(db, "consent_logs"), {
        userId: user.uid,
        consents: userConsents,
        timestamp: new Date(),
        formType: "pre_study"
      });

      // Actualizar estado del usuario
      await updateDoc(doc(db, "users", user.uid), {
        formSubmitted: true,
        status: "Evaluación"
      });

      setShowFinalConsentModal(false);
      
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

  // 🎯 NUEVA FUNCIÓN: Resumen de datos opcionales
  const getOptionalDataSummary = () => {
    const selectedCount = [
      userConsents.incomeData,
      userConsents.healthConditions, 
      userConsents.servicesInfo
    ].filter(Boolean).length;

    if (selectedCount === 0) {
      return "No autorizaste información adicional opcional";
    } else if (selectedCount === 3) {
      return "Autorizaste toda la información adicional opcional";
    } else {
      return `Autorizaste ${selectedCount} tipo(s) de información adicional`;
    }
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
        <Text style={styles.dataPurpose}>
          • Para determinar el tamaño del paquete alimentario
        </Text>
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
        <Text style={styles.dataPurpose}>
          • Para incluir nutrientes esenciales para el crecimiento
        </Text>
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
        <Text style={styles.dataPurpose}>
          • Información para análisis estadístico
        </Text>
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
        <Text style={styles.dataPurpose}>
          • Para evaluar tu seguridad alimentaria
        </Text>
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
        <Text style={styles.dataPurpose}>
          • Para priorizar apoyos según urgencia
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
        <Text style={styles.dataPurpose}>
          • Para entender la variedad en tu alimentación
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
      
      {/* 🎯 MEJORAR: Mostrar resumen de lo que se va a incluir */}
      <View style={styles.optionalInfoHeader}>
        <Ionicons name="information-circle" size={20} color="#4CAF50" />
        <Text style={styles.optionalInfoText}>
          {getOptionalDataSummary()}
        </Text>
      </View>

      <Text style={styles.stepSubtitle}>
        Completa la información que autorizaste compartir
      </Text>

      {/* 🎯 SECCIÓN DE DATOS ECONÓMICOS - SOLO SI AUTORIZADO */}
      {userConsents.incomeData ? (
        <View style={styles.questionBlock}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash" size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Situación Económica</Text>
          </View>
          <Text style={styles.questionLabel}>
            ¿Cuál es el ingreso mensual aproximado del hogar?
          </Text>
          <Text style={styles.dataPurpose}>
            • Para validar tu elegibilidad según criterios del programa
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
      ) : (
        <View style={styles.optionalSectionDisabled}>
          <Ionicons name="cash" size={24} color="#A0AEC0" />
          <Text style={styles.optionalSectionDisabledText}>
            Situación Económica - No autorizada
          </Text>
        </View>
      )}

      {/* 🎯 SECCIÓN DE SALUD - SOLO SI AUTORIZADO */}
      {userConsents.healthConditions ? (
        <View style={styles.questionBlock}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Condiciones de Salud</Text>
          </View>
          <Text style={styles.questionLabel}>
            ¿Algún miembro del hogar tiene condiciones especiales de salud?
          </Text>
          <Text style={styles.dataPurpose}>
            • Para identificar necesidades nutricionales especiales
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
      ) : (
        <View style={styles.optionalSectionDisabled}>
          <Ionicons name="medical" size={24} color="#A0AEC0" />
          <Text style={styles.optionalSectionDisabledText}>
            Condiciones de Salud - No autorizadas
          </Text>
        </View>
      )}

      {/* 🎯 SECCIÓN DE SERVICIOS - SOLO SI AUTORIZADO */}
      {userConsents.servicesInfo ? (
        <View style={styles.questionBlock}>
          <View style={styles.sectionHeader}>
            <Ionicons name="home" size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Servicios Básicos</Text>
          </View>
          <Text style={styles.questionLabel}>¿Con qué servicios básicos cuentas?</Text>
          <Text style={styles.dataPurpose}>
            • Para evaluación de condiciones de vida
          </Text>
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
      ) : (
        <View style={styles.optionalSectionDisabled}>
          <Ionicons name="home" size={24} color="#A0AEC0" />
          <Text style={styles.optionalSectionDisabledText}>
            Servicios Básicos - No autorizados
          </Text>
        </View>
      )}

      {/* 🎯 MENSAJE SI NO HAY DATOS OPCIONALES */}
      {!userConsents.incomeData && !userConsents.healthConditions && !userConsents.servicesInfo && (
        <View style={styles.noOptionalData}>
          <Ionicons name="checkmark-done" size={48} color="#4CAF50" />
          <Text style={styles.noOptionalDataTitle}>¡Formulario Completo!</Text>
          <Text style={styles.noOptionalDataText}>
            Has proporcionado toda la información esencial. Puedes enviar tu solicitud.
          </Text>
          <Text style={styles.noOptionalDataHint}>
            Si deseas agregar información adicional, regresa al inicio y modifica tus autorizaciones.
          </Text>
        </View>
      )}
    </View>
  );

  const renderInitialConsentModal = () => (
    <View style={styles.consentModal}>
      <View style={styles.consentContainer}>
        <Ionicons name="document-text" size={48} color="#4CAF50" />
        <Text style={styles.consentTitle}>Autorización de Datos</Text>
        <Text style={styles.consentSubtitle}>
          Selecciona qué información adicional deseas compartir para tu evaluación
        </Text>

        <ScrollView style={styles.consentScroll}>
          <Text style={styles.consentIntro}>
            Información esencial requerida para todos los solicitantes:
          </Text>

          <View style={styles.consentSection}>
            <Text style={styles.consentSectionTitle}>📋 Información Requerida</Text>
            
            {/* Información del hogar - REQUERIDA */}
            <View style={styles.consentItem}>
              <View style={styles.consentCheckbox}>
                <View style={[styles.checkbox, styles.checkboxChecked, styles.checkboxDisabled]}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
                <Text style={styles.consentItemTitle}>
                  Información del Hogar
                </Text>
                <Text style={styles.consentRequired}>(Requerido)</Text>
              </View>
              <Text style={styles.consentDescription}>
                Total de personas y menores de edad para calcular el paquete alimentario
              </Text>
            </View>

            {/* Situación alimentaria - REQUERIDA */}
            <View style={styles.consentItem}>
              <View style={styles.consentCheckbox}>
                <View style={[styles.checkbox, styles.checkboxChecked, styles.checkboxDisabled]}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
                <Text style={styles.consentItemTitle}>
                  Situación Alimentaria
                </Text>
                <Text style={styles.consentRequired}>(Requerido)</Text>
              </View>
              <Text style={styles.consentDescription}>
                Frecuencia de comidas y acceso a alimentos para evaluación nutricional
              </Text>
            </View>
          </View>

          <View style={styles.consentSection}>
            <Text style={styles.consentSectionTitle}>📊 Información Opcional</Text>
            <Text style={styles.consentOptionalIntro}>
              Esta información ayuda a una evaluación más precisa (puedes seleccionar cuáles compartir):
            </Text>
            
            {/* Datos económicos - OPCIONAL */}
            <View style={styles.consentItem}>
              <View style={styles.consentCheckbox}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    userConsents.incomeData && styles.checkboxChecked
                  ]}
                  onPress={() => setUserConsents(prev => ({
                    ...prev,
                    incomeData: !prev.incomeData
                  }))}
                >
                  {userConsents.incomeData && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </TouchableOpacity>
                <Text style={styles.consentItemTitle}>
                  Situación Económica
                </Text>
              </View>
              <Text style={styles.consentDescription}>
                Ingresos mensuales para validar elegibilidad según criterios del programa
              </Text>
            </View>

            {/* Condiciones de salud - OPCIONAL */}
            <View style={styles.consentItem}>
              <View style={styles.consentCheckbox}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    userConsents.healthConditions && styles.checkboxChecked
                  ]}
                  onPress={() => setUserConsents(prev => ({
                    ...prev,
                    healthConditions: !prev.healthConditions
                  }))}
                >
                  {userConsents.healthConditions && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </TouchableOpacity>
                <Text style={styles.consentItemTitle}>
                  Condiciones de Salud
                </Text>
              </View>
              <Text style={styles.consentDescription}>
                Información de salud para identificar necesidades nutricionales especiales
              </Text>
            </View>

            {/* Servicios básicos - OPCIONAL */}
            <View style={styles.consentItem}>
              <View style={styles.consentCheckbox}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    userConsents.servicesInfo && styles.checkboxChecked
                  ]}
                  onPress={() => setUserConsents(prev => ({
                    ...prev,
                    servicesInfo: !prev.servicesInfo
                  }))}
                >
                  {userConsents.servicesInfo && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </TouchableOpacity>
                <Text style={styles.consentItemTitle}>
                  Servicios Básicos
                </Text>
              </View>
              <Text style={styles.consentDescription}>
                Agua, luz, drenaje para evaluación de condiciones de vida
              </Text>
            </View>
          </View>

          {/* Resumen de selección */}
          <View style={styles.selectionSummary}>
            <Text style={styles.selectionSummaryTitle}>Resumen de tu selección:</Text>
            <Text style={styles.selectionSummaryText}>
              • Información del Hogar: ✅ Incluida{'\n'}
              • Situación Alimentaria: ✅ Incluida{'\n'}
              • Situación Económica: {userConsents.incomeData ? '✅ Incluida' : '❌ No incluida'}{'\n'}
              • Condiciones de Salud: {userConsents.healthConditions ? '✅ Incluidas' : '❌ No incluidas'}{'\n'}
              • Servicios Básicos: {userConsents.servicesInfo ? '✅ Incluidos' : '❌ No incluidos'}
            </Text>
          </View>

          <View style={styles.privacyGuarantee}>
            <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
            <Text style={styles.privacyGuaranteeText}>
              Todos los datos están protegidos y solo se utilizan para los fines del programa de apoyo alimentario.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.consentButtons}>
          <TouchableOpacity
            style={styles.consentRejectButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.consentRejectText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.consentAcceptButton}
            onPress={handleConsentComplete}
          >
            <Text style={styles.consentAcceptText}>
              Continuar al Formulario
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFinalConsentModal = () => (
    <View style={styles.consentModal}>
      <View style={styles.consentContainer}>
        <Text style={styles.consentTitle}>Autorización Final de Datos</Text>
        <Text style={styles.consentSubtitle}>
          Confirma los datos que enviarás para tu evaluación
        </Text>

        <ScrollView style={styles.consentScroll}>
          {/* Consentimiento para información del hogar */}
          <View style={styles.consentItem}>
            <View style={styles.consentCheckbox}>
              <View style={[styles.checkbox, styles.checkboxChecked, styles.checkboxDisabled]}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
              <Text style={styles.consentItemTitle}>
                Información del Hogar
              </Text>
              <Text style={styles.consentRequired}> (Requerido)</Text>
            </View>
            <Text style={styles.consentDescription}>
              Total de personas y menores de edad para calcular el paquete alimentario
            </Text>
          </View>

          {/* Consentimiento para seguridad alimentaria */}
          <View style={styles.consentItem}>
            <View style={styles.consentCheckbox}>
              <View style={[styles.checkbox, styles.checkboxChecked, styles.checkboxDisabled]}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
              <Text style={styles.consentItemTitle}>
                Situación Alimentaria
              </Text>
              <Text style={styles.consentRequired}> (Requerido)</Text>
            </View>
            <Text style={styles.consentDescription}>
              Frecuencia de comidas y acceso a alimentos para evaluación nutricional
            </Text>
          </View>

          {/* Consentimiento para datos económicos */}
          <View style={styles.consentItem}>
            <View style={styles.consentCheckbox}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  userConsents.incomeData && styles.checkboxChecked
                ]}
                onPress={() => setUserConsents(prev => ({
                  ...prev,
                  incomeData: !prev.incomeData
                }))}
              >
                {userConsents.incomeData && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>
              <Text style={styles.consentItemTitle}>
                Situación Económica
              </Text>
            </View>
            <Text style={styles.consentDescription}>
              Ingresos y empleo para validar elegibilidad (opcional pero recomendado)
            </Text>
          </View>

          {/* Consentimiento para condiciones de salud */}
          <View style={styles.consentItem}>
            <View style={styles.consentCheckbox}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  userConsents.healthConditions && styles.checkboxChecked
                ]}
                onPress={() => setUserConsents(prev => ({
                  ...prev,
                  healthConditions: !prev.healthConditions
                }))}
              >
                {userConsents.healthConditions && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>
              <Text style={styles.consentItemTitle}>
                Condiciones de Salud
              </Text>
            </View>
            <Text style={styles.consentDescription}>
              Información de salud para identificar necesidades especiales (opcional)
            </Text>
          </View>

          {/* Consentimiento para servicios básicos */}
          <View style={styles.consentItem}>
            <View style={styles.consentCheckbox}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  userConsents.servicesInfo && styles.checkboxChecked
                ]}
                onPress={() => setUserConsents(prev => ({
                  ...prev,
                  servicesInfo: !prev.servicesInfo
                }))}
              >
                {userConsents.servicesInfo && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>
              <Text style={styles.consentItemTitle}>
                Servicios Básicos
              </Text>
            </View>
            <Text style={styles.consentDescription}>
              Agua, luz, drenaje para evaluación de condiciones de vida (opcional)
            </Text>
          </View>
        </ScrollView>

        <View style={styles.consentButtons}>
          <TouchableOpacity
            style={styles.consentCancelButton}
            onPress={() => setShowFinalConsentModal(false)}
          >
            <Text style={styles.consentCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.consentSubmitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.consentSubmitText}>Aceptar y Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {!consentCompleted ? (
        renderInitialConsentModal()
      ) : (
        <>
          {/* Header */}
          <ImageBackground 
            source={require('../../../assets/background.jpg')}
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
                onPress={handleFirstSubmit}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Enviar formulario</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Modal de consentimiento final */}
          {showFinalConsentModal && renderFinalConsentModal()}
        </>
      )}
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
  dataPurpose: {
    fontSize: 13,
    color: "#4CAF50",
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
  checkboxDisabled: {
    opacity: 0.6,
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
  // Modal styles
  consentModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  consentContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
    width: '90%',
  },
  consentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  consentSubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 20,
  },
  consentScroll: {
    maxHeight: 400,
  },
  consentSection: {
    marginBottom: 20,
  },
  consentSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  consentItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  consentCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  consentItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 12,
    flex: 1,
  },
  consentRequired: {
    fontSize: 12,
    color: '#E53E3E',
    fontWeight: '500',
  },
  consentDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  consentIntro: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  consentOptionalIntro: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  privacyGuarantee: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    marginTop: 10,
  },
  privacyGuaranteeText: {
    flex: 1,
    fontSize: 14,
    color: '#2B6CB0',
    marginLeft: 12,
    lineHeight: 20,
  },
  consentRejectButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#E53E3E',
    alignItems: 'center',
    marginRight: 6,
  },
  consentRejectText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  consentAcceptButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    marginLeft: 6,
  },
  consentAcceptText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  consentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  consentCancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
  },
  consentCancelText: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  consentSubmitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  consentSubmitText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  // Nuevos estilos para Paso 3
  optionalInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  optionalInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#2B6CB0',
    marginLeft: 12,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 8,
  },
  optionalSectionDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  optionalSectionDisabledText: {
    fontSize: 14,
    color: '#A0AEC0',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  noOptionalData: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    marginTop: 20,
  },
  noOptionalDataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 12,
    marginBottom: 8,
  },
  noOptionalDataText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
  noOptionalDataHint: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  selectionSummary: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  selectionSummaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2B6CB0',
    marginBottom: 8,
  },
  selectionSummaryText: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 20,
  },
});