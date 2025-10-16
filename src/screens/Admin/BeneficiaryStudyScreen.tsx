import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../firebaseconfig";

export default function BeneficiaryStudyScreen({ navigation, route }: any) {
  const { beneficiaryId, beneficiaryName } = route.params || {};
  const [preStudyData, setPreStudyData] = useState<any>(null);
  const [fullStudyData, setFullStudyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudyData = async () => {
      if (!beneficiaryId) {
        console.warn("No se recibió beneficiaryId");
        setLoading(false);
        return;
      }

      try {
        // Buscar el pre-estudio más reciente
        const preStudyQuery = query(
          collection(db, "pre_socioNutritionalForms"),
          where("userId", "==", beneficiaryId),
          orderBy("submittedAt", "desc"),
          limit(1)
        );

        const preStudySnapshot = await getDocs(preStudyQuery);
        
        if (!preStudySnapshot.empty) {
          const doc = preStudySnapshot.docs[0];
          setPreStudyData(doc.data());
        }

        // Buscar el estudio completo más reciente
        const fullStudyQuery = query(
          collection(db, "socioNutritionalForms"),
          where("userId", "==", beneficiaryId),
          orderBy("submittedAt", "desc"),
          limit(1)
        );

        const fullStudySnapshot = await getDocs(fullStudyQuery);
        
        if (!fullStudySnapshot.empty) {
          const doc = fullStudySnapshot.docs[0];
          setFullStudyData(doc.data());
        }

      } catch (error) {
        console.error("Error al obtener datos del estudio:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudyData();
  }, [beneficiaryId]);

  const hasFullStudy = fullStudyData !== null;
  const hasPreStudy = preStudyData !== null;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#E53E3E" />
        <Text style={styles.loadingText}>Cargando estudios...</Text>
      </View>
    );
  }

  const renderPreStudyContent = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="document-text" size={24} color="#4CAF50" />
        <Text style={styles.sectionTitle}>Pre-Estudio Socio-Nutricional</Text>
      </View>

      {/* Información del Hogar - COMPLETA */}
      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>🏠 Información del Hogar</Text>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Total de personas en el hogar:</Text>
          <Text style={styles.dataValue}>{preStudyData.household?.totalPersonas || "No especificado"}</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Menores de edad:</Text>
          <Text style={styles.dataValue}>{preStudyData.household?.menoresEdad || "No especificado"}</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Adultos que trabajan:</Text>
          <Text style={styles.dataValue}>{preStudyData.household?.adultosTrabajar || "No especificado"}</Text>
        </View>
      </View>

      {/* Situación Alimentaria - COMPLETA */}
      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>🍎 Situación Alimentaria</Text>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Frecuencia de 3 comidas al día:</Text>
          <Text style={styles.dataValue}>{preStudyData.foodSecurity?.frecuenciaComidas || "No especificado"}</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>¿Se ha quedado sin alimentos por falta de dinero?</Text>
          <Text style={styles.dataValue}>
            {preStudyData.foodSecurity?.faltaAlimentos ? "Sí" : "No"}
          </Text>
        </View>

        {preStudyData.foodSecurity?.tiposAlimentos?.length > 0 && (
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Tipos de alimentos consumidos:</Text>
            <Text style={styles.dataValue}>
              {preStudyData.foodSecurity.tiposAlimentos.join(", ")}
            </Text>
          </View>
        )}
      </View>

      {/* Situación Económica - COMPLETA (si autorizada) */}
      {preStudyData.economicSituation && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>💰 Situación Económica</Text>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Ingreso mensual aproximado:</Text>
            <Text style={styles.dataValue}>{preStudyData.economicSituation.ingresoMensual}</Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Adultos que trabajan:</Text>
            <Text style={styles.dataValue}>{preStudyData.economicSituation.adultosTrabajar}</Text>
          </View>
        </View>
      )}

      {/* Condiciones de Salud - COMPLETA (si autorizadas) */}
      {preStudyData.healthConditions && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>🏥 Condiciones de Salud</Text>
          
          {preStudyData.healthConditions.condicionesSalud?.length > 0 ? (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Condiciones de salud reportadas:</Text>
              <Text style={styles.dataValue}>
                {preStudyData.healthConditions.condicionesSalud.join(", ")}
              </Text>
            </View>
          ) : (
            <Text style={styles.noDataText}>No se reportaron condiciones de salud</Text>
          )}
          
          {preStudyData.healthConditions.detallesCondiciones && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Detalles adicionales:</Text>
              <Text style={styles.dataValue}>{preStudyData.healthConditions.detallesCondiciones}</Text>
            </View>
          )}
        </View>
      )}

      {/* Servicios Básicos - COMPLETA (si autorizados) */}
      {preStudyData.basicServices && preStudyData.basicServices.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>🏡 Servicios Básicos</Text>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Servicios con los que cuenta:</Text>
            <Text style={styles.dataValue}>
              {preStudyData.basicServices.join(", ")}
            </Text>
          </View>
        </View>
      )}

      {/* Consentimientos - COMPLETA */}
      {preStudyData.consents && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>📋 Consentimientos Otorgados</Text>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Información del Hogar:</Text>
            <Text style={styles.dataValue}>
              {preStudyData.consents.householdInfo ? "✅ Autorizado" : "❌ No autorizado"}
            </Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Situación Alimentaria:</Text>
            <Text style={styles.dataValue}>
              {preStudyData.consents.foodSecurity ? "✅ Autorizado" : "❌ No autorizado"}
            </Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Situación Económica:</Text>
            <Text style={styles.dataValue}>
              {preStudyData.consents.incomeData ? "✅ Autorizado" : "❌ No autorizado"}
            </Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Condiciones de Salud:</Text>
            <Text style={styles.dataValue}>
              {preStudyData.consents.healthConditions ? "✅ Autorizado" : "❌ No autorizado"}
            </Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Servicios Básicos:</Text>
            <Text style={styles.dataValue}>
              {preStudyData.consents.servicesInfo ? "✅ Autorizado" : "❌ No autorizado"}
            </Text>
          </View>
        </View>
      )}

      {/* Metadatos - COMPLETA */}
      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>📊 Información del Pre-Estudio</Text>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Estado del pre-estudio:</Text>
          <Text style={styles.dataValue}>{preStudyData.status || "Pendiente de revisión"}</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Fecha de consentimiento:</Text>
          <Text style={styles.dataValue}>
            {preStudyData.consentTimestamp?.toDate?.().toLocaleDateString('es-MX') || "No disponible"}
          </Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Fecha de envío:</Text>
          <Text style={styles.dataValue}>
            {preStudyData.submittedAt?.toDate?.().toLocaleDateString('es-MX') || "No disponible"}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFullStudyContent = () => (
    <View style={styles.fullStudySection}>
      <View style={styles.sectionHeader}>
        <Ionicons name="analytics" size={24} color="#E53E3E" />
        <Text style={styles.sectionTitle}>Estudio Socio-Nutricional Completo</Text>
      </View>

      {/* Información del Hogar Completa */}
      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Información del Hogar</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Total de personas:</Text>
          <Text style={styles.dataValue}>{fullStudyData.totalPersonas || "No especificado"}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Menores de edad:</Text>
          <Text style={styles.dataValue}>{fullStudyData.menoresEdad || "No especificado"}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Adultos que trabajan:</Text>
          <Text style={styles.dataValue}>{fullStudyData.adultosTrabajar || "No especificado"}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Adultos mayores:</Text>
          <Text style={styles.dataValue}>{fullStudyData.adultosMayores || "No especificado"}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Niños menores de 5 años:</Text>
          <Text style={styles.dataValue}>{fullStudyData.niñosMenores5 || "No especificado"}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Personas con discapacidad:</Text>
          <Text style={styles.dataValue}>
            {fullStudyData.personasDiscapacidad ? "Sí" : "No"}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Espacio para cocinar:</Text>
          <Text style={styles.dataValue}>{fullStudyData.espacioCocina || "No especificado"}</Text>
        </View>
      </View>

      {/* Situación Alimentaria Completa */}
      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Situación Alimentaria</Text>
        {fullStudyData.tiposAlimentos?.length > 0 && (
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Alimentos consumidos:</Text>
            <Text style={styles.dataValue}>
              {fullStudyData.tiposAlimentos.join(", ")}
            </Text>
          </View>
        )}
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Consumo de proteínas:</Text>
          <Text style={styles.dataValue}>{fullStudyData.consumoProteínas || "No especificado"}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Consumo de fibra:</Text>
          <Text style={styles.dataValue}>{fullStudyData.consumoFibra || "No especificado"}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Ultraprocesados:</Text>
          <Text style={styles.dataValue}>{fullStudyData.ultraprocesados || "No especificado"}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Dormir con hambre:</Text>
          <Text style={styles.dataValue}>
            {fullStudyData.dormirConHambre ? "Sí" : "No"}
          </Text>
        </View>
      </View>

      {/* Salud y Condiciones Médicas */}
      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Salud y Condiciones Médicas</Text>
        {fullStudyData.condicionesSalud?.length > 0 ? (
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Condiciones de salud:</Text>
            <Text style={styles.dataValue}>
              {fullStudyData.condicionesSalud.join(", ")}
            </Text>
          </View>
        ) : (
          <Text style={styles.noDataText}>No se reportaron condiciones de salud</Text>
        )}
        {fullStudyData.dietaEspecial && (
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Dieta especial:</Text>
            <Text style={styles.dataValue}>{fullStudyData.dietaEspecial}</Text>
          </View>
        )}
        {fullStudyData.hospitalizacionesNutricion && (
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Hospitalizaciones:</Text>
            <Text style={styles.dataValue}>{fullStudyData.hospitalizacionesNutricion}</Text>
          </View>
        )}
      </View>

      {/* Situación Económica */}
      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Situación Económica</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Ingreso mensual:</Text>
          <Text style={styles.dataValue}>{fullStudyData.ingresoMensual || "No especificado"}</Text>
        </View>
        {fullStudyData.serviciosBasicos?.length > 0 && (
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Servicios básicos:</Text>
            <Text style={styles.dataValue}>
              {fullStudyData.serviciosBasicos.join(", ")}
            </Text>
          </View>
        )}
      </View>

      {/* Metadatos */}
      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Información del Estudio</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Estado:</Text>
          <Text style={styles.dataValue}>{fullStudyData.status || "Completado"}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Fecha de envío:</Text>
          <Text style={styles.dataValue}>
            {fullStudyData.submittedAt?.toDate?.().toLocaleDateString('es-MX') || "No disponible"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBackButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#E53E3E" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {beneficiaryName ? `Estudios - ${beneficiaryName}` : 'Estudios del Beneficiario'}
        </Text>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!preStudyData && !hasFullStudy ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#CBD5E0" />
            <Text style={styles.emptyText}>No se encontraron estudios</Text>
            <Text style={styles.emptySubtext}>
              Este beneficiario no tiene estudios socio-nutricionales registrados
            </Text>
            
          </View>
        ) : (
          <View style={styles.studyCard}>
            {/* Pre-Estudio COMPLETO */}
            {preStudyData && renderPreStudyContent()}

            {/* Botón para ver/crear estudio completo */}
            <View style={styles.actionSection}>
              {hasFullStudy ? (
                <>
                  <Text style={styles.actionTitle}>🎯 Estudio Completo Disponible</Text>
                  <Text style={styles.actionSubtitle}>
                    Este beneficiario ya tiene un estudio socio-nutricional completo registrado.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.actionTitle}>📝 Estudio Completo Pendiente</Text>
                  <Text style={styles.actionSubtitle}>
                    Complete el estudio socio-nutricional detallado para este beneficiario.
                  </Text>
                </>
              )}

              <TouchableOpacity
                style={styles.fullStudyButton}
                onPress={() => navigation.navigate("SocioNutritionalForm", { 
                  beneficiaryId: beneficiaryId,
                  beneficiaryName: beneficiaryName 
                })}
              >
                <Ionicons 
                  name={hasFullStudy ? "eye-outline" : "add-circle-outline"} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.fullStudyButtonText}>
                  {"Ver Estudio Completo"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mostrar datos del estudio completo si existen */}
            {hasFullStudy && renderFullStudyContent()}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerBackButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E53E3E",
    textAlign: "center",
    flex: 1,
  },
  placeholder: {
    width: 34,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A5568",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
    textAlign: "center",
    marginBottom: 20,
  },
  studyCard: {
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  fullStudySection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: "#E53E3E",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
    marginLeft: 8,
  },
  subsection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingVertical: 4,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    color: "#2D3748",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  noDataText: {
    fontSize: 14,
    color: "#718096",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 8,
  },
  // Estilos para la sección de acciones
  actionSection: {
    backgroundColor: "rgba(229, 62, 62, 0.05)",
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(229, 62, 62, 0.2)",
    alignItems: "center",
    marginBottom: 20,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E53E3E",
    marginBottom: 4,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    marginBottom: 16,
  },
  fullStudyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53E3E",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    width: "100%",
  },
  fullStudyButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  createStudyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53E3E",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
  },
  createStudyButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});