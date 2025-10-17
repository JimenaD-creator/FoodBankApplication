import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
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

  const InfoCard = ({ icon, label, value, iconColor = "#4CAF50" }: any) => (
    <View style={styles.infoCard}>
      <View style={[styles.infoIconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  const renderPreStudyContent = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="document-text" size={22} color="#4CAF50" />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Pre-Estudio Socio-Nutricional</Text>
            <Text style={styles.sectionSubtitle}>Información preliminar del beneficiario</Text>
          </View>
        </View>
      </View>

      {/* Información del Hogar */}
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>🏠 Información del Hogar</Text>
        <View style={styles.cardGrid}>
          <InfoCard 
            icon="people" 
            label="Total de personas" 
            value={preStudyData.household?.totalPersonas || "No especificado"}
            iconColor="#3B82F6"
          />
          <InfoCard 
            icon="happy" 
            label="Menores de edad" 
            value={preStudyData.household?.menoresEdad || "No especificado"}
            iconColor="#8B5CF6"
          />
          <InfoCard 
            icon="briefcase" 
            label="Adultos trabajando" 
            value={preStudyData.household?.adultosTrabajar || "No especificado"}
            iconColor="#F59E0B"
          />
        </View>
      </View>

      {/* Situación Alimentaria */}
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>🍎 Situación Alimentaria</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Frecuencia de 3 comidas al día</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {preStudyData.foodSecurity?.frecuenciaComidas || "No especificado"}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Falta de alimentos por falta de dinero</Text>
            <View style={[styles.statusBadge, preStudyData.foodSecurity?.faltaAlimentos ? styles.statusDanger : styles.statusSuccess]}>
              <Ionicons 
                name={preStudyData.foodSecurity?.faltaAlimentos ? "close-circle" : "checkmark-circle"} 
                size={16} 
                color="#fff" 
              />
              <Text style={styles.statusText}>
                {preStudyData.foodSecurity?.faltaAlimentos ? "Sí" : "No"}
              </Text>
            </View>
          </View>

          {preStudyData.foodSecurity?.tiposAlimentos?.length > 0 && (
            <View style={styles.detailRowColumn}>
              <Text style={styles.detailLabel}>Tipos de alimentos consumidos</Text>
              <View style={styles.tagsContainer}>
                {preStudyData.foodSecurity.tiposAlimentos.map((alimento: string, index: number) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{alimento}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Situación Económica */}
      {preStudyData.economicSituation && (
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>💰 Situación Económica</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ingreso mensual aproximado</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{preStudyData.economicSituation.ingresoMensual}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Adultos que trabajan</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{preStudyData.economicSituation.adultosTrabajar}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Condiciones de Salud */}
      {preStudyData.healthConditions && (
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>🏥 Condiciones de Salud</Text>
          <View style={styles.detailsCard}>
            {preStudyData.healthConditions.condicionesSalud?.length > 0 ? (
              <View style={styles.detailRowColumn}>
                <Text style={styles.detailLabel}>Condiciones reportadas</Text>
                <View style={styles.tagsContainer}>
                  {preStudyData.healthConditions.condicionesSalud.map((condicion: string, index: number) => (
                    <View key={index} style={[styles.tag, styles.tagWarning]}>
                      <Text style={styles.tagText}>{condicion}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>✓ No se reportaron condiciones de salud</Text>
            )}
            
            {preStudyData.healthConditions.detallesCondiciones && (
              <View style={styles.detailRowColumn}>
                <Text style={styles.detailLabel}>Detalles adicionales</Text>
                <Text style={styles.detailValue}>{preStudyData.healthConditions.detallesCondiciones}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Servicios Básicos */}
      {preStudyData.basicServices && preStudyData.basicServices.length > 0 && (
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>🏡 Servicios Básicos</Text>
          <View style={styles.detailsCard}>
            <View style={styles.tagsContainer}>
              {preStudyData.basicServices.map((servicio: string, index: number) => (
                <View key={index} style={[styles.tag, styles.tagInfo]}>
                  <Ionicons name="checkmark-circle" size={14} color="#3B82F6" />
                  <Text style={[styles.tagText, { color: "#3B82F6" }]}>{servicio}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Información del Pre-Estudio */}
      <View style={styles.metadataCard}>
        <View style={styles.metadataRow}>
          <Ionicons name="calendar-outline" size={18} color="#718096" />
          <Text style={styles.metadataLabel}>Fecha de envío</Text>
          <Text style={styles.metadataValue}>
            {preStudyData.submittedAt?.toDate?.().toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) || "No disponible"}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFullStudyContent = () => (
    <View style={styles.fullStudySection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.iconBadge, { backgroundColor: "#FEE2E2" }]}>
            <Ionicons name="analytics" size={22} color="#E53E3E" />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Estudio Socio-Nutricional Completo</Text>
            <Text style={styles.sectionSubtitle}>Análisis detallado del beneficiario</Text>
          </View>
        </View>
      </View>

      {/* Información del Hogar Completa */}
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>🏠 Información del Hogar Completa</Text>
        <View style={styles.cardGrid}>
          <InfoCard icon="people" label="Total de personas" value={fullStudyData.totalPersonas || "N/A"} iconColor="#3B82F6" />
          <InfoCard icon="happy" label="Menores de edad" value={fullStudyData.menoresEdad || "N/A"} iconColor="#8B5CF6" />
          <InfoCard icon="briefcase" label="Adultos trabajando" value={fullStudyData.adultosTrabajar || "N/A"} iconColor="#F59E0B" />
          <InfoCard icon="time" label="Adultos mayores" value={fullStudyData.adultosMayores || "N/A"} iconColor="#10B981" />
          <InfoCard icon="heart" label="Niños < 5 años" value={fullStudyData.niñosMenores5 || "N/A"} iconColor="#EC4899" />
          <InfoCard 
            icon="accessibility" 
            label="Con discapacidad" 
            value={fullStudyData.personasDiscapacidad ? "Sí" : "No"} 
            iconColor="#6366F1" 
          />
        </View>
        
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Espacio para cocinar</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{fullStudyData.espacioCocina || "No especificado"}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Situación Alimentaria Completa */}
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>🍎 Análisis Alimentario Detallado</Text>
        <View style={styles.detailsCard}>
          {fullStudyData.tiposAlimentos?.length > 0 && (
            <View style={styles.detailRowColumn}>
              <Text style={styles.detailLabel}>Alimentos consumidos regularmente</Text>
              <View style={styles.tagsContainer}>
                {fullStudyData.tiposAlimentos.map((alimento: string, index: number) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{alimento}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Consumo de proteínas</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{fullStudyData.consumoProteínas || "N/A"}</Text></View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Consumo de fibra</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{fullStudyData.consumoFibra || "N/A"}</Text></View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ultraprocesados</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{fullStudyData.ultraprocesados || "N/A"}</Text></View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>¿Duerme con hambre?</Text>
            <View style={[styles.statusBadge, fullStudyData.dormirConHambre ? styles.statusDanger : styles.statusSuccess]}>
              <Ionicons name={fullStudyData.dormirConHambre ? "alert-circle" : "checkmark-circle"} size={16} color="#fff" />
              <Text style={styles.statusText}>{fullStudyData.dormirConHambre ? "Sí" : "No"}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Salud y Condiciones Médicas */}
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>🏥 Salud y Condiciones Médicas</Text>
        <View style={styles.detailsCard}>
          {fullStudyData.condicionesSalud?.length > 0 ? (
            <View style={styles.detailRowColumn}>
              <Text style={styles.detailLabel}>Condiciones de salud reportadas</Text>
              <View style={styles.tagsContainer}>
                {fullStudyData.condicionesSalud.map((condicion: string, index: number) => (
                  <View key={index} style={[styles.tag, styles.tagWarning]}>
                    <Text style={styles.tagText}>{condicion}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>✓ No se reportaron condiciones de salud</Text>
          )}
          
          {fullStudyData.dietaEspecial && (
            <View style={styles.detailRowColumn}>
              <Text style={styles.detailLabel}>Dieta especial requerida</Text>
              <Text style={styles.detailValue}>{fullStudyData.dietaEspecial}</Text>
            </View>
          )}
          
          {fullStudyData.hospitalizacionesNutricion && (
            <View style={styles.detailRowColumn}>
              <Text style={styles.detailLabel}>Hospitalizaciones relacionadas con nutrición</Text>
              <Text style={styles.detailValue}>{fullStudyData.hospitalizacionesNutricion}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Situación Económica */}
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>💰 Situación Económica</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ingreso mensual familiar</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{fullStudyData.ingresoMensual || "N/A"}</Text>
            </View>
          </View>
          
          {fullStudyData.serviciosBasicos?.length > 0 && (
            <View style={styles.detailRowColumn}>
              <Text style={styles.detailLabel}>Servicios básicos disponibles</Text>
              <View style={styles.tagsContainer}>
                {fullStudyData.serviciosBasicos.map((servicio: string, index: number) => (
                  <View key={index} style={[styles.tag, styles.tagInfo]}>
                    <Ionicons name="checkmark-circle" size={14} color="#3B82F6" />
                    <Text style={[styles.tagText, { color: "#3B82F6" }]}>{servicio}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Metadatos */}
      <View style={styles.metadataCard}>
        <View style={styles.metadataRow}>
          <Ionicons name="calendar-outline" size={18} color="#718096" />
          <Text style={styles.metadataLabel}>Fecha de registro</Text>
          <Text style={styles.metadataValue}>
            {fullStudyData.submittedAt?.toDate?.().toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) || "No disponible"}
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
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Estudios del Beneficiario</Text>
          {beneficiaryName && <Text style={styles.headerSubtitle}>{beneficiaryName}</Text>}
        </View>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!preStudyData && !hasFullStudy ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="document-text-outline" size={64} color="#CBD5E0" />
            </View>
            <Text style={styles.emptyText}>Sin estudios registrados</Text>
            <Text style={styles.emptySubtext}>
              Este beneficiario aún no ha completado ningún estudio socio-nutricional
            </Text>
          </View>
        ) : (
          <View style={styles.studyCard}>
            {/* Pre-Estudio */}
            {preStudyData && renderPreStudyContent()}

            {/* Estado del Estudio Completo */}
            <View style={[styles.statusCard, hasFullStudy ? styles.statusCardSuccess : styles.statusCardPending]}>
              <View style={styles.statusCardHeader}>
                <Ionicons 
                  name={hasFullStudy ? "checkmark-circle" : "time-outline"} 
                  size={32} 
                  color={hasFullStudy ? "#10B981" : "#F59E0B"} 
                />
                <View style={styles.statusCardContent}>
                  <Text style={styles.statusCardTitle}>
                    {hasFullStudy ? "Estudio Completo Realizado" : "Estudio Completo Pendiente"}
                  </Text>
                  <Text style={styles.statusCardSubtitle}>
                    {hasFullStudy 
                      ? "El beneficiario ha completado su estudio socio-nutricional detallado"
                      : "El beneficiario aún no ha completado el estudio socio-nutricional detallado"
                    }
                  </Text>
                </View>
              </View>
              
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
    backgroundColor: "#F9FAFB",
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
    fontWeight: "500",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerBackButton: {
    padding: 5,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E53E3E",
    fontWeight: "600",
    marginTop: 2,
  },
  placeholder: {
    width: 34,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
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
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  emptyInfoText: {
    flex: 1,
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },
  studyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  section: {
    marginBottom: 24,
  },
  fullStudySection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 12,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    flex: 1,
    minWidth: "47%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
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
    fontSize: 15,
    fontWeight: "bold",
    color: "#1F2937",
  },
  detailsCard: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailRowColumn: {
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  badge: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  statusSuccess: {
    backgroundColor: "#10B981",
  },
  statusDanger: {
    backgroundColor: "#EF4444",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  tagInfo: {
    backgroundColor: "#DBEAFE",
  },
  tagWarning: {
    backgroundColor: "#FEF3C7",
  },
  tagText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#065F46",
  },
  noDataText: {
    fontSize: 14,
    color: "#10B981",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
  metadataCard: {
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metadataLabel: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
  },
  metadataValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  statusCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
  },
  statusCardSuccess: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
  },
  statusCardPending: {
    backgroundColor: "#FFFBEB",
    borderColor: "#F59E0B",
  },
  statusCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statusCardContent: {
    flex: 1,
  },
  statusCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  statusCardSubtitle: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  statusCardNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  statusCardNoteText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },
});