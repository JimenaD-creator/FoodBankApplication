"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { collection, query, where, getDocs, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebaseconfig"
import { useNavigation } from "@react-navigation/native"
import type { NavigationProp } from "../../../App"

interface Delivery {
  id: string
  communityName: string
  municipio: string
  deliveryDate: any
  volunteers: { id: string; name: string }[]
  products: any
  beneficiary: { id: string }
  status: "Programada" | "En camino" | "Entregado"
}

interface UserData {
  status: string;
  community: string;
}

type BeneficiaryDashboardNavigationProp = NavigationProp;

export default function BeneficiaryDashboard() {
  const navigation = useNavigation<BeneficiaryDashboardNavigationProp>()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [userCommunity, setUserCommunity] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userName, setUserName] = useState<string>("")
  const [userStatus, setUserStatus] = useState<string>("")
  const [hasCompletedForm, setHasCompletedForm] = useState<boolean>(false)

  useEffect(() => {
    let unsubscribe: any

    const init = async () => {
      unsubscribe = await loadUserData()
    }

    init()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const loadUserData = async () => {
    try {
      const user = auth.currentUser
      if (!user) return

      setUserName(user.displayName || "Beneficiario")

      // Obtener datos del usuario
      const userDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", user.uid)))

      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data() as UserData
        const community = userData.community
        const status = userData.status || "Pendiente"
        
        setUserCommunity(community)
        setUserStatus(status)

        // Verificar si el usuario ya completó el formulario
        await checkFormCompletion(user.uid)

        // Solo cargar entregas si el usuario no está pendiente
        if (status !== "Pendiente") {
          const unsubscribe = loadDeliveries(user.uid)
          return unsubscribe
        }
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkFormCompletion = async (userId: string) => {
    try {
      const formDoc = await getDoc(doc(db, "pre_socioNutritionalForms", userId))
      setHasCompletedForm(formDoc.exists())
    } catch (error) {
      console.error("Error verificando formulario:", error)
      setHasCompletedForm(false)
    }
  }

  const loadDeliveries = (userId: string) => {
    const q = query(
      collection(db, "scheduledDeliveries"),
      where("beneficiary.id", "==", userId),
      orderBy("deliveryDate", "desc"),
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const deliveriesList: Delivery[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Delivery, "id">),
        }))

      setDeliveries(deliveriesList)
    })

    return unsubscribe
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadUserData()
    setRefreshing(false)
  }

  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate()
    return date.toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timestamp: any) => {
    const date = timestamp.toDate()
    return date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Programada":
        return "#2196F3"
      case "En camino":
        return "#FF9800"
      case "Entregado":
      case "entregada":
        return "#4CAF50"
      default:
        return "#718096"
    }
  }
  const handleDeliveryDetails = (delivery: Delivery) => {
    navigation.navigate("DeliveryDetails", { delivery })
  }

  const handleProfilePress = () => {
    navigation.navigate("ProfileScreen")
  }

  const handlePreStudyForm = () => {
    navigation.navigate("PreStudyForm")
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    )
  }

  // Separar entregas futuras y pasadas
  const now = new Date();
  const upcomingDeliveries = deliveries.filter(d => d.deliveryDate.toDate() >= now);
  const pastDeliveries = deliveries.filter(d => d.deliveryDate.toDate() < now);

  const showFormOnly = userStatus === "Pendiente" && !hasCompletedForm;
  const showAwaitingReview = userStatus === "Pendiente" && hasCompletedForm;
  const showContactMessage = userStatus === "Evaluación";
  const showDeliveries = userStatus === "Aprobado";

  // La próxima entrega sería la primera futura
  const nextDelivery = upcomingDeliveries[0];

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={require("../../../assets/background.jpg")}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="home" size={28} color="#4CAF50" />
            <Text style={styles.title}>Mis Entregas</Text>
          </View>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleProfilePress}>
            <Ionicons name="person-circle" size={40} color="#E53E3E" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Bienvenida */}
      <View style={styles.welcomeCard}>
        <Ionicons name="happy" size={20} color="#4CAF50" />
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeTitle}>Hola, {userName} 👋</Text>
          <Text style={styles.welcomeSubtitle}>{userCommunity || "No asignada"}</Text>
          <Text style={styles.status}>
            Estado: {userStatus === "Pendiente" ? "Pendiente": userStatus === "Evaluación" ? "Evaluación" : "Activo"}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* CASO 1: Usuario pendiente sin formulario */}
        {showFormOnly && (
          <View style={styles.formOnlyContainer}>
            <Ionicons name="document-text-outline" size={80} color="#E53E3E" />
            <Text style={styles.formOnlyTitle}>Complete su formulario inicial</Text>
            <Text style={styles.formOnlySubtitle}>
              Para comenzar a recibir sus entregas, necesitamos que complete el estudio socio-nutricional inicial.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handlePreStudyForm}>
              <Text style={styles.primaryButtonText}>Llenar formulario</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CASO 2: Usuario pendiente CON formulario completado (AWAITING REVIEW) */}
        {showAwaitingReview && (
          <View style={styles.contactMessageContainer}>
            <Ionicons name="time-outline" size={80} color="#FF9800" />
            <Text style={styles.contactMessageTitle}>Formulario completado, en revisión</Text>
            <Text style={styles.contactMessageSubtitle}>
              Hemos recibido su formulario. Nos pondremos en contacto con usted pronto para continuar con el proceso.
            </Text>
            <View style={styles.contactInfo}>
              <Ionicons name="information-circle" size={20} color="#2196F3" />
              <Text style={styles.contactInfoText}>
                Estado: En revisión (Pendiente de Evaluador)
              </Text>
            </View>
          </View>
        )}

        {/* CASO 3: Usuario en evaluación (Antiguo CASO 2) */}
        {showContactMessage && (
          <View style={styles.contactMessageContainer}>
            <Ionicons name="time-outline" size={80} color="#FF9800" />
            <Text style={styles.contactMessageTitle}>¡Felicidades, estás en evaluación!</Text>
            <Text style={styles.contactMessageSubtitle}>
              Pronto un administrador se pondrá en contacto para finalizar el proceso de ingreso al programa.
            </Text>
            <View style={styles.contactInfo}>
              <Ionicons name="information-circle" size={20} color="#2196F3" />
              <Text style={styles.contactInfoText}>
                Estado: Contacto en curso
              </Text>
            </View>
          </View>
        )}

        {/* CASO 4: Usuario activo - Mostrar entregas normal */}
        {showDeliveries && (
          <>
            {/* Próxima entrega */}
            {nextDelivery && (
              <TouchableOpacity
                style={[styles.deliveryCard, { borderLeftColor: getStatusColor(nextDelivery.status) }]}
                onPress={() => handleDeliveryDetails(nextDelivery)}
              >
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(nextDelivery.status)}]}>
                  <Text style={styles.statusText}>{nextDelivery.status}</Text>
                </View>

                <Text style={{ fontWeight: "600", fontSize: 16, marginBottom: 4 }}>Próxima entrega</Text>
                <Text>
                  {nextDelivery.communityName}, {nextDelivery.municipio}
                </Text>
                <Text>
                  {formatDate(nextDelivery.deliveryDate)} | {formatTime(nextDelivery.deliveryDate)}
                </Text>
                <TouchableOpacity
                  style={{ marginTop: 10, alignSelf: "flex-start" }}
                  onPress={() => handleDeliveryDetails(nextDelivery)}
                >
                  <Text style={{ color: "#2196F3", fontWeight: "600" }}>Ver detalles</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}

            {/* ✅ SECCIÓN: Otras entregas - SÓLO si hay más de 1 entrega futura */}
            {upcomingDeliveries.length > 1 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Otras entregas</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{upcomingDeliveries.length - 1}</Text>
                  </View>
                </View>

                {upcomingDeliveries.slice(1).map((delivery) => (
                  <View key={delivery.id} style={[styles.deliveryCard, { borderLeftColor: getStatusColor(delivery.status) }]}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) }]}>
                      <Text style={styles.statusText}>{delivery.status}</Text>
                    </View>
                    <Text style={{ fontWeight: "600", fontSize: 16, marginBottom: 4 }}>
                      {delivery.communityName}, {delivery.municipio}
                    </Text>
                    <Text>
                      {formatDate(delivery.deliveryDate)} | {formatTime(delivery.deliveryDate)}
                    </Text>
                    {delivery.products && Object.keys(delivery.products).length > 0 && (
                      <TouchableOpacity
                        style={{ marginTop: 8 }}
                        onPress={() => handleDeliveryDetails(delivery)}
                      >
                        <Text style={{ color: "#2196F3", fontWeight: "600" }}>Ver contenido de la despensa</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </>
            )}

            {/* ✅ SECCIÓN: Historial de entregas (pasadas) */}
            {pastDeliveries.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Historial de entregas</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{pastDeliveries.length}</Text>
                  </View>
                </View>

                {pastDeliveries.map((delivery) => (
                  <View key={delivery.id} style={[styles.deliveryCard, styles.pastDeliveryCard, { borderLeftColor: getStatusColor(delivery.status) }]}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) }]}>
                      <Text style={styles.statusText}>{delivery.status}</Text>
                    </View>
                    <Text style={{ fontWeight: "600", fontSize: 16, marginBottom: 4 }}>
                      {delivery.communityName}, {delivery.municipio}
                    </Text>
                    <Text>
                      {formatDate(delivery.deliveryDate)} | {formatTime(delivery.deliveryDate)}
                    </Text>
                    <Text style={styles.pastDeliveryText}>Entregada</Text>
                    {delivery.products && Object.keys(delivery.products).length > 0 && (
                      <TouchableOpacity
                        style={{ marginTop: 8 }}
                        onPress={() => handleDeliveryDetails(delivery)}
                      >
                        <Text style={{ color: "#2196F3", fontWeight: "600" }}>Ver contenido entregado</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </>
            )}

            {/* Mensaje si no hay entregas - SÓLO cuando es usuario activo y no tiene NINGUNA entrega */}
            {showDeliveries && deliveries.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color="#E2E8F0" />
                <Text style={styles.emptyStateTitle}>No hay entregas programadas</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Una vez que se te asignen entregas, aparecerán aquí.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F7FAFC" 
  },
  headerBackground: { 
    paddingTop: 40, 
    paddingBottom: 20 
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
  headerLeft: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12 
  },
  title: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#2D3748" 
  },
  avatarContainer: { 
    padding: 5 
  },
  loadingText: { 
    fontSize: 18, 
    color: "#4A5568", 
    textAlign: "center", 
    marginTop: 50 
  },
  welcomeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  welcomeTextContainer: { 
    flex: 1 
  },
  welcomeTitle: { 
    fontSize: 16, 
    color: "#2D3748", 
    fontWeight: "600" 
  },
  welcomeSubtitle: { 
    fontSize: 14, 
    color: "#718096" 
  },
  status: {
    color: "#718096",
    fontSize: 12,
    marginTop: 2,
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 20 
  },
  sectionHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 24, 
    marginBottom: 16 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#2D3748" 
  },
  countBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  countBadgeText: { 
    fontSize: 12, 
    fontWeight: "bold", 
    color: "#fff" 
  },
  emptyState: { 
    alignItems: "center", 
    paddingVertical: 60, 
    paddingHorizontal: 40 
  },
  emptyStateTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#4A5568", 
    marginTop: 16, 
    textAlign: "center" 
  },
  emptyStateSubtitle: { 
    fontSize: 14, 
    color: "#718096", 
    marginTop: 8, 
    textAlign: "center" 
  },
  emptySection: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  emptySectionText: {
    fontSize: 14,
    color: "#A0AEC0",
    marginTop: 8,
    textAlign: "center",
  },
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  statusText: { 
    fontSize: 12, 
    color: "#fff", 
    marginTop: 2 
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  
  // Nuevos estilos para los diferentes estados
  formOnlyContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 16,
    marginTop: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  formOnlyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2D3748",
    marginTop: 16,
    textAlign: "center",
  },
  formOnlySubtitle: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  
  contactMessageContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 16,
    marginTop: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  contactMessageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2D3748",
    marginTop: 16,
    textAlign: "center",
  },
  contactMessageSubtitle: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  contactInfoText: {
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "500",
  },
  
  // Botones
  primaryButton: {
    backgroundColor: "#E53E3E",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  // ✅ NUEVOS ESTILOS: Para entregas pasadas
  pastDeliveryCard: {
    opacity: 0.8,
    backgroundColor: "#F7FAFC",
  },
  pastDeliveryText: {
    fontSize: 12,
    color: "#718096",
    fontStyle: "italic",
    marginTop: 4,
  },
})