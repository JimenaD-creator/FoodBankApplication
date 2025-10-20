import type React from "react"
import { View, Text, StyleSheet, Pressable, ScrollView, Image, ImageBackground } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../App"
import { Linking } from 'react-native'
import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "./firebaseconfig"

type LandingNavigationProp = NativeStackNavigationProp<RootStackParamList, "Landing">

interface LandingPageProps {
  navigation: LandingNavigationProp
}

const LandingPage: React.FC<LandingPageProps> = ({ navigation }) => {
  const heroImageSource = {
    uri: "https://cdn.milenio.com/uploads/media/2023/05/22/banco-alimentos-ubica-santa-maria.jpg",
  }

  const [noticeContent, setNoticeContent] = useState("Sin avisos")

  useEffect(() => {
    const loadNoticeContent = async () => {
      try {
        const noticeDoc = await getDoc(doc(db, "settings", "landingNotice"))
        if (noticeDoc.exists()) {
          setNoticeContent(noticeDoc.data().content)
        }
      } catch (error) {
        console.error("Error loading notice content:", error)
      }
    }

    loadNoticeContent()
  }, [])

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Mejorado */}
      <ImageBackground 
        source={require('../../assets/background.jpg')}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <Image 
            style={styles.logoIm} 
            source={require('../../assets/logo_no_background.png')} 
          />
          <View style={styles.headerRight}>
            <Ionicons name="menu" size={28} color="#E53E3E" />
          </View>
        </View>
      </ImageBackground>

      {/* Hero Section Mejorado */}
      <View style={styles.heroSection}>
        <ImageBackground 
          source={heroImageSource} 
          style={styles.heroImage} 
          imageStyle={styles.heroImageStyle}
        >
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Entre todos,</Text>
              <Text style={styles.heroSubtitle}>hacemos más mesas.</Text>
              <Text style={styles.heroDescription}>
                              Trabajamos juntos para combatir el hambre y la desnutrición
                            </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Notice Section Mejorado */}
      <View style={styles.noticeSection}>
        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <View style={styles.noticeBadge}>
              <Ionicons name="megaphone" size={20} color="#fff" />
            </View>
            <Text style={styles.noticeTitle}>AVISOS</Text>
          </View>
          
          <View style={styles.noticeIconContainer}>
            <View style={styles.noticeIcon}>
              <Text style={styles.noticeIconText}>🍎</Text>
            </View>
          </View>
          
          <Text style={styles.noticeContent}>{noticeContent}</Text>
          
          <View style={styles.noticeFooterContainer}>
            <Ionicons name="people" size={16} color="#E53E3E" />
            <Text style={styles.noticeFooter}>Comunidad de BAMX Guadalajara</Text>
          </View>
        </View>
      </View>

      {/* Statistics Section Mejorado */}
      <View style={styles.statsSection}>
        <View style={styles.statsSectionHeader}>
          <View style={styles.statsTitleContainer}>
            <Ionicons name="trending-up" size={28} color="#E53E3E" />
            <Text style={styles.statsSectionTitle}>Nuestro Impacto</Text>
          </View>
          <Text style={styles.statsSectionSubtitle}>
            Transformando vidas cada día
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardRed]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="home" size={32} color="#fff" />
            </View>
            <Text style={styles.statNumber}>30,211</Text>
            <Text style={styles.statLabel}>Familias atendidas mensualmente</Text>
          </View>

          <View style={[styles.statCard, styles.statCardDark]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people" size={32} color="#fff" />
            </View>
            <Text style={styles.statNumber}>137,027</Text>
            <Text style={styles.statLabel}>Personas atendidas mensualmente</Text>
          </View>

          <View style={[styles.statCard, styles.statCardGreen]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="restaurant" size={32} color="#fff" />
            </View>
            <Text style={styles.statNumber}>15M+ kg</Text>
            <Text style={styles.statLabel}>Alimento acopiado</Text>
          </View>

          <View style={[styles.statCard, styles.statCardBlue]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="business" size={32} color="#fff" />
            </View>
            <Text style={styles.statNumber}>155</Text>
            <Text style={styles.statLabel}>Instituciones atendidas</Text>
          </View>
        </View>
      </View>

      {/* Donate Section Mejorado */}
      <View style={styles.donateSection}>
        <View style={styles.donateSectionHeader}>
          <Ionicons name="gift" size={32} color="#F59E0B" />
          <Text style={styles.donateSectionTitle}>Haz una donación</Text>
        </View>
        
        <View style={styles.donateImageContainer}>
          <Image
            source={{
              uri: "https://www.daysoftheyear.com/cdn-cgi/image/dpr=1%2Cf=auto%2Cfit=cover%2Ch=1331%2Cq=85%2Cw=2000/wp-content/uploads/international-day-of-charity-1.jpg",
            }}
            style={styles.donateImage}
            resizeMode="cover"
          />
          <View style={styles.donateImageOverlay}>
            <Ionicons name="heart" size={48} color="#fff" />
          </View>
        </View>
        
        <Text style={styles.donateDescription}>
          Tu apoyo nos ayuda a llevar alimento a quienes más lo necesitan. 
          Cada contribución hace la diferencia.
        </Text>
        
        <Pressable 
          style={styles.donateButton}
          onPress={() => Linking.openURL('https://bdalimentos.org/make-a-donation/?cause_id=8492')}
        >
          <Ionicons name="card" size={22} color="#92400E" />
          <Text style={styles.donateButtonText}>Donar ahora</Text>
          <Ionicons name="arrow-forward" size={22} color="#92400E" />
        </Pressable>
      </View>

      {/* Footer Mejorado */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Image 
            style={styles.footerLogo} 
            source={require('../../assets/logo_no_background.png')}
          />
          <Text style={styles.footerText}>
            Juntos construimos un futuro mejor
          </Text>
          <View style={styles.footerDivider} />
          <View style={styles.footerIcons}>
            <Pressable style={styles.footerIconButton}>
              <Ionicons name="globe" size={24} color="#fff" />
            </Pressable>
            <Pressable style={styles.footerIconButton}>
              <Ionicons name="logo-facebook" size={24} color="#fff" />
            </Pressable>
            <Pressable style={styles.footerIconButton}>
              <Ionicons name="logo-instagram" size={24} color="#fff" />
            </Pressable>
          </View>
          <Text style={styles.footerCopyright}>
            © 2024 Banco de Alimentos. Todos los derechos reservados.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default LandingPage

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F9FAFB" 
  },
  
  // Header
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
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logoIm: {
    width: 100,
    height: 50,
    resizeMode: 'contain',
  },
  headerRight: {
    padding: 8,
  },

  // Hero Section
  heroSection: { 
    margin: 20,
    marginTop: 10,
  },
  heroImage: { 
    width: "100%", 
    height: 350,
    justifyContent: "flex-end",
  },
  heroImageStyle: {
    borderRadius: 24,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: 24,
  },
  heroContent: {
    padding: 24,
  },
  heroTextContainer: {
   position: "absolute", 
    bottom: 16, 
    left: 16 
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  heroTagline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroDescription: {
    fontSize: 16,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginTop: 4,
  },

  // Notice Section
  noticeSection: { 
    margin: 20,
  },
  noticeCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#E53E3E",
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  noticeBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E53E3E",
    justifyContent: "center",
    alignItems: "center",
  },
  noticeTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#1F2937",
  },
  noticeIconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  noticeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeIconText: { 
    fontSize: 40,
  },
  noticeContent: { 
    textAlign: "center", 
    color: "#4B5563", 
    marginBottom: 16,
    fontSize: 15,
    lineHeight: 22,
  },
  noticeFooterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  noticeFooter: { 
    fontWeight: "600", 
    color: "#E53E3E",
    fontSize: 14,
  },

  // Stats Section
  statsSection: {
    margin: 20,
  },
  statsSectionHeader: {
    marginBottom: 24,
  },
  statsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 8,
  },
  statsSectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
  },
  statsSectionSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    width: "48%",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  statCardRed: {
    backgroundColor: "#E53E3E",
  },
  statCardDark: {
    backgroundColor: "#374151",
  },
  statCardGreen: {
    backgroundColor: "#10B981",
  },
  statCardBlue: {
    backgroundColor: "#3B82F6",
  },
  statIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
  },

  // Donate Section
  donateSection: { 
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  donateSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  donateSectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  donateImageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  donateImage: {
    width: "100%",
    height: "100%",
  },
  donateImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  donateDescription: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  donateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF3C7",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    borderWidth: 2,
    borderColor: "#F59E0B",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  donateButtonText: { 
    fontWeight: "bold", 
    fontSize: 18, 
    color: "#92400E",
  },

  // Footer
  footer: { 
    backgroundColor: "#1F2937",
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  footerContent: {
    alignItems: "center",
  },
  footerLogo: {
    width: 120,
    height: 60,
    resizeMode: "contain",
    marginBottom: 16,
  },
  footerText: {
    fontSize: 15,
    color: "#D1D5DB",
    textAlign: "center",
    marginBottom: 20,
  },
  footerDivider: {
    width: 60,
    height: 2,
    backgroundColor: "#E53E3E",
    marginBottom: 20,
  },
  footerIcons: { 
    flexDirection: "row", 
    gap: 16,
    marginBottom: 20,
  },
  footerIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  footerCopyright: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
});