import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../firebaseconfig";

export default function BeneficiaryStudyScreen({ navigation, route }: any) {
  const { beneficiaryId, beneficiaryName } = route.params || {};
  const [preStudyData, setPreStudyData] = useState<any>(null);
  const [fullStudyData, setFullStudyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['household', 'food']));

  useEffect(() => {
    const fetchStudyData = async () => {
      if (!beneficiaryId) {
        console.warn("No se recibió beneficiaryId");
        setLoading(false);
        return;
      }

      try {
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

        const fullStudyQuery = query(
          collection(db, "socioNutritionalForms"),
          where("beneficiaryId", "==", beneficiaryId),
          orderBy("submittedAt", "desc"),
          limit(1)
        );

        const fullStudySnapshot = await getDocs(fullStudyQuery);
        
        if (!fullStudySnapshot.empty) {
          const doc = fullStudySnapshot.docs[0];
          setFullStudyData(doc.data());
          console.log("📋 Estudio completo encontrado:", doc.data());
        }

      } catch (error) {
        console.error("Error al obtener datos del estudio:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudyData();
  }, [beneficiaryId]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

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

  const CollapsibleSection = ({ 
    id, 
    icon, 
    title, 
    subtitle, 
    iconBg, 
    iconColor, 
    children 
  }: any) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <View style={styles.collapsibleCard}>
        <TouchableOpacity 
          style={[styles.collapsibleHeader, { backgroundColor: iconBg }]}
          onPress={() => toggleSection(id)}
          activeOpacity={0.7}
        >
          <View style={styles.collapsibleHeaderLeft}>
            <View style={[styles.collapsibleIconContainer, { backgroundColor: '#fff' }]}>
              <Ionicons name={icon} size={24} color={iconColor} />
            </View>
            <View style={styles.collapsibleTextContainer}>
              <Text style={styles.collapsibleTitle}>{title}</Text>
              <Text style={styles.collapsibleSubtitle}>{subtitle}</Text>
            </View>
          </View>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#4B5563" 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.collapsibleContent}>
            {children}
          </View>
        )}
      </View>
    );
  };

  const renderPreStudyContent = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderCard}>
        <View style={styles.sectionHeaderBadge}>
          <Ionicons name="document-text" size={28} color="#fff" />
        </View>
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionHeaderTitle}>Pre-Estudio Socio-Nutricional</Text>
          <Text style={styles.sectionHeaderSubtitle}>Información preliminar registrada</Text>
        </View>
      </View>

      {/* Información del Hogar */}
      <CollapsibleSection
        id="household"
        icon="home"
        title="Información del Hogar"
        subtitle="Composición familiar"
        iconBg="#DBEAFE"
        iconColor="#3B82F6"
      >
        <View style={styles.cardGrid}>
          <InfoCard 
            icon="people" 
            label="Total de personas" 
            value={preStudyData.household?.totalPersonas || "N/A"}
            iconColor="#3B82F6"
          />
          <InfoCard 
            icon="happy" 
            label="Menores de edad" 
            value={preStudyData.household?.menoresEdad || "N/A"}
            iconColor="#8B5CF6"
          />
          <InfoCard 
            icon="briefcase" 
            label="Adultos trabajando" 
            value={preStudyData.household?.adultosTrabajar || "N/A"}
            iconColor="#F59E0B"
          />
        </View>
      </CollapsibleSection>

      {/* Situación Alimentaria */}
      <CollapsibleSection
        id="food"
        icon="restaurant"
        title="Situación Alimentaria"
        subtitle="Acceso a alimentos"
        iconBg="#D1FAE5"
        iconColor="#10B981"
      >
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Frecuencia de 3 comidas</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {preStudyData.foodSecurity?.frecuenciaComidas || "N/A"}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Falta de alimentos</Text>
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
              <Text style={styles.detailLabel}>Alimentos consumidos</Text>
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
      </CollapsibleSection>

      {/* Situación Económica */}
      {preStudyData.economicSituation && (
        <CollapsibleSection
          id="economic"
          icon="cash"
          title="Situación Económica"
          subtitle="Ingresos familiares"
          iconBg="#FEF3C7"
          iconColor="#F59E0B"
        >
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ingreso mensual</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{preStudyData.economicSituation.ingresoMensual}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Adultos trabajando</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{preStudyData.economicSituation.adultosTrabajar}</Text>
              </View>
            </View>
          </View>
        </CollapsibleSection>
      )}

      {/* Condiciones de Salud */}
      {preStudyData.healthConditions && (
        <CollapsibleSection
          id="health"
          icon="medical"
          title="Condiciones de Salud"
          subtitle="Estado de salud familiar"
          iconBg="#FCE7F3"
          iconColor="#EC4899"
        >
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
              <Text style={styles.noDataText}>✓ Sin condiciones de salud reportadas</Text>
            )}
            
            {preStudyData.healthConditions.detallesCondiciones && (
              <View style={styles.detailRowColumn}>
                <Text style={styles.detailLabel}>Detalles</Text>
                <Text style={styles.detailValue}>{preStudyData.healthConditions.detallesCondiciones}</Text>
              </View>
            )}
          </View>
        </CollapsibleSection>
      )}

      {/* Servicios Básicos */}
      {preStudyData.basicServices && preStudyData.basicServices.length > 0 && (
        <CollapsibleSection
          id="services"
          icon="business"
          title="Servicios Básicos"
          subtitle="Infraestructura del hogar"
          iconBg="#E0E7FF"
          iconColor="#6366F1"
        >
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
        </CollapsibleSection>
      )}

      {/* Metadata */}
      <View style={styles.metadataCard}>
        <Ionicons name="time-outline" size={20} color="#6B7280" />
        <Text style={styles.metadataText}>
          Registrado el {preStudyData.submittedAt?.toDate?.().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) || "fecha no disponible"}
        </Text>
      </View>
    </View>
  );

  const renderFullStudyContent = () => (
    <View style={styles.fullStudySection}>
      <View style={styles.sectionHeaderCard}>
        <View style={[styles.sectionHeaderBadge, { backgroundColor: '#E53E3E' }]}>
          <Ionicons name="analytics" size={28} color="#fff" />
        </View>
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionHeaderTitle}>Estudio Completo</Text>
          <Text style={styles.sectionHeaderSubtitle}>Análisis detallado nutricional</Text>
        </View>
      </View>

      {/* Información del Hogar Completa */}
      <CollapsibleSection
        id="household-full"
        icon="home"
        title="Información del Hogar Completa"
        subtitle="Detalles de la composición familiar"
        iconBg="#DBEAFE"
        iconColor="#3B82F6"
      >
        <View style={styles.cardGrid}>
          <InfoCard icon="people" label="Total personas" value={fullStudyData.totalPersonas || "N/A"} iconColor="#3B82F6" />
          <InfoCard icon="happy" label="Menores" value={fullStudyData.menoresEdad || "N/A"} iconColor="#8B5CF6" />
          <InfoCard icon="briefcase" label="Trabajando" value={fullStudyData.adultosTrabajar || "N/A"} iconColor="#F59E0B" />
          <InfoCard icon="time" label="Adultos mayores" value={fullStudyData.adultosMayores || "N/A"} iconColor="#10B981" />
          <InfoCard icon="heart" label="Niños < 5 años" value={fullStudyData.niñosMenores5 || "N/A"} iconColor="#EC4899" />
          <InfoCard icon="accessibility" label="Con discapacidad" value={fullStudyData.personasDiscapacidad ? "Sí" : "No"} iconColor="#6366F1" />
        </View>
        
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Espacio para cocinar</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{fullStudyData.espacioCocina || "N/A"}</Text>
            </View>
          </View>
        </View>
      </CollapsibleSection>

      {/* Situación Alimentaria Completa */}
      <CollapsibleSection
        id="food-full"
        icon="nutrition"
        title="Análisis Alimentario"
        subtitle="Consumo y hábitos nutricionales"
        iconBg="#D1FAE5"
        iconColor="#10B981"
      >
        <View style={styles.detailsCard}>
          {fullStudyData.tiposAlimentos?.length > 0 && (
            <View style={styles.detailRowColumn}>
              <Text style={styles.detailLabel}>Alimentos consumidos</Text>
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
            <Text style={styles.detailLabel}>Proteínas</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{fullStudyData.consumoProteínas || "N/A"}</Text></View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fibra</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{fullStudyData.consumoFibra || "N/A"}</Text></View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ultraprocesados</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{fullStudyData.ultraprocesados || "N/A"}</Text></View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duerme con hambre</Text>
            <View style={[styles.statusBadge, fullStudyData.dormirConHambre ? styles.statusDanger : styles.statusSuccess]}>
              <Ionicons name={fullStudyData.dormirConHambre ? "alert-circle" : "checkmark-circle"} size={16} color="#fff" />
              <Text style={styles.statusText}>{fullStudyData.dormirConHambre ? "Sí" : "No"}</Text>
            </View>
          </View>
        </View>
      </CollapsibleSection>

      {/* Salud */}
      <CollapsibleSection
        id="health-full"
        icon="fitness"
        title="Salud y Condiciones Médicas"
        subtitle="Historial médico y dietas"
        iconBg="#FCE7F3"
        iconColor="#EC4899"
      >
        <View style={styles.detailsCard}>
          {fullStudyData.condicionesSalud?.length > 0 ? (
            <View style={styles.detailRowColumn}>
              <Text style={styles.detailLabel}>Condiciones reportadas</Text>
              <View style={styles.tagsContainer}>
                {fullStudyData.condicionesSalud.map((condicion: string, index: number) => (
                  <View key={index} style={[styles.tag, styles.tagWarning]}>
                    <Text style={styles.tagText}>{condicion}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>✓ Sin condiciones de salud reportadas</Text>
          )}
          
          {fullStudyData.dietaEspecial && (
            <View style={styles.detailRowColumn}>
              <Text style={styles.detailLabel}>Dieta especial</Text>
              <Text style={styles.detailValue}>{fullStudyData.dietaEspecial}</Text>
            </View>
          )}
          
          {fullStudyData.hospitalizacionesNutricion && (
            <View style={styles.detailRowColumn}>
              <Text style={styles.detailLabel}>Hospitalizaciones</Text>
              <Text style={styles.detailValue}>{fullStudyData.hospitalizacionesNutricion}</Text>
            </View>
          )}
        </View>
      </CollapsibleSection>

      {/* Economía */}
      <CollapsibleSection
        id="economic-full"
        icon="wallet"
        title="Situación Económica"
        subtitle="Ingresos y servicios"
        iconBg="#FEF3C7"
        iconColor="#F59E0B"
      >
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ingreso mensual</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{fullStudyData.ingresoMensual || "N/A"}</Text>
            </View>
          </View>
          
          {fullStudyData.serviciosBasicos?.length > 0 && (
            <View style={styles.detailRowColumn}>
              <Text style={styles.detailLabel}>Servicios básicos</Text>
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
      </CollapsibleSection>

      {/* Metadata */}
      <View style={styles.metadataCard}>
        <Ionicons name="time-outline" size={20} color="#6B7280" />
        <Text style={styles.metadataText}>
          Registrado el {fullStudyData.submittedAt?.toDate?.().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) || "fecha no disponible"}
        </Text>
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
          <TouchableOpacity 
            style={styles.headerBackButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Estudios del Beneficiario</Text>
            {beneficiaryName && <Text style={styles.headerSubtitle}>{beneficiaryName}</Text>}
          </View>
          
          <View style={styles.placeholder} />
        </View>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!preStudyData && !hasFullStudy ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="document-text-outline" size={64} color="#E53E3E" />
            </View>
            <Text style={styles.emptyText}>Sin estudios registrados</Text>
            <Text style={styles.emptySubtext}>
              Este beneficiario aún no ha completado ningún estudio socio-nutricional
            </Text>
          </View>
        ) : (
          <View>
            {/* Pre-Estudio */}
            {preStudyData && renderPreStudyContent()}

            {/* Estado del Estudio Completo */}
            <View style={[styles.statusCard, hasFullStudy ? styles.statusCardSuccess : styles.statusCardPending]}>
              <View style={styles.statusCardIcon}>
                <Ionicons 
                  name={hasFullStudy ? "checkmark-circle" : "time"} 
                  size={48} 
                  color={hasFullStudy ? "#10B981" : "#F59E0B"} 
                />
              </View>
              <View style={styles.statusCardContent}>
                <Text style={styles.statusCardTitle}>
                  {hasFullStudy ? "✓ Estudio Completo" : "⏳ Estudio Pendiente"}
                </Text>
                <Text style={styles.statusCardSubtitle}>
                  {hasFullStudy 
                    ? "El estudio socio-nutricional detallado está completado"
                    : "Aún falta completar el estudio socio-nutricional detallado"
                  }
                </Text>
              </View>
            </View>

            {/* Estudio Completo */}
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
    backgroundColor: "#F3F4F6",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
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
    paddingVertical: 18,
    backgroundColor: "#E53E3E",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    shadowColor: "#E53E3E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerBackButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "600",
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  fullStudySection: {
    marginTop: 8,
  },
  sectionHeaderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionHeaderBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  sectionHeaderSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  collapsibleCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  collapsibleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  collapsibleHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  collapsibleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  collapsibleTextContainer: {
    flex: 1,
  },
  collapsibleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  collapsibleSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  collapsibleContent: {
    padding: 16,
    paddingTop: 0,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
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
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 2,
    fontWeight: "500",
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  metadataText: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statusCardSuccess: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
  },
  statusCardPending: {
    backgroundColor: "#FFFBEB",
    borderColor: "#F59E0B",
  },
  statusCardIcon: {
    marginRight: 16,
  },
  statusCardContent: {
    flex: 1,
  },
  statusCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 6,
  },
  statusCardSubtitle: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
});