import type React from "react"
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from "react-native"
import { FontAwesome5, Feather } from "@expo/vector-icons"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../App"
import { Linking } from 'react-native';
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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image style={styles.logoIm} source={require('../../assets/logo_no_background.png')} />
        
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image source={heroImageSource} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroText}>Entre todos,{"\n"}hacemos más mesas.</Text>
        </View>
      </View>

      {/* Notice Section */}
      <View style={styles.noticeSection}>
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>AVISO</Text>
          <View style={styles.noticeIcon}>
            <Text style={styles.noticeIconText}>🍎</Text>
          </View>
          <Text style={styles.noticeContent}>{noticeContent}</Text>
          <Text style={styles.noticeFooter}>Comunidad de BANX Guadalajara</Text>
        </View>
      </View>

      {/* Statistics Section */}
      <View style={styles.statsSection}>
        <Text style={styles.statsSectionTitle}>Nuestro Impacto</Text>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: "#e53935" }]}>
            <Text style={styles.statNumber}>30,211</Text>
            <Text style={styles.statLabel}>Familias atendidas mensualmente</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#424242" }]}>
            <Text style={styles.statNumber}>137,027</Text>
            <Text style={styles.statLabel}>Personas atendidas mensualmente</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#e53935" }]}>
            <Text style={styles.statNumber}>15M+ kg</Text>
            <Text style={styles.statLabel}>Alimento acopiado</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#424242" }]}>
            <Text style={styles.statNumber}>155</Text>
            <Text style={styles.statLabel}>Instituciones atendidas</Text>
          </View>
        </View>
      </View>

      {/* Registration CTA */}
  

      {/* Donate Section */}
      <View style={styles.donateSection}>
        <View style={styles.donateImageContainer}>
          <Image
            source={{
              uri: "https://www.daysoftheyear.com/cdn-cgi/image/dpr=1%2Cf=auto%2Cfit=cover%2Ch=1331%2Cq=85%2Cw=2000/wp-content/uploads/international-day-of-charity-1.jpg",
            }}
            style={styles.donateImage}
            resizeMode="cover"
          />
        </View>
        <Pressable 
          style={styles.donateButton}
          onPress={() => Linking.openURL('https://bdalimentos.org/make-a-donation/?cause_id=8492')}
        >
          <Text style={styles.donateButtonText}>Dona aquí</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Image style={styles.logoIm} source={require('../../assets/logo_no_background.png')} />
        <View style={styles.footerIcons}>
          <Feather name="globe" size={24} color="#444" />
        </View>
      </View>
    </ScrollView>
  )
}

export default LandingPage

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  
  // Header
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    padding: 16, 
    alignItems: "center", 
    paddingTop: 30 
  },
  logoIm: {
    width: 90,
    height: 60,
    resizeMode: 'contain',
  },
  headerIcons: { 
    flexDirection: "row", 
    gap: 12 
  },
  iconButton: { 
    padding: 8 
  },

  // Hero Section
  heroSection: { 
    position: "relative", 
    marginVertical: 16, 
    marginHorizontal: 16 
  },
  heroImage: { 
    width: "100%", 
    height: 300, 
    borderRadius: 12 
  },
  heroTextContainer: { 
    position: "absolute", 
    bottom: 16, 
    left: 16 
  },
  heroText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },

  // Notice Section
  noticeSection: { 
    margin: 16 
  },
  noticeCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  noticeTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 12 
  },
  noticeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e53935",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  noticeIconText: { 
    color: "#fff", 
    fontSize: 28 
  },
  noticeContent: { 
    textAlign: "center", 
    color: "#555", 
    marginBottom: 12 
  },
  noticeFooter: { 
    textAlign: "center", 
    fontWeight: "bold", 
    color: "#222" 
  },

  // Statistics Section
  statsSection: {
    margin: 16,
    marginTop: 24,
  },
  statsSectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#222",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
  },

  // Registration Section
  registerSection: { 
    margin: 16, 
    padding: 16, 
    backgroundColor: "#FFF9C4", 
    borderRadius: 12, 
    alignItems: "center" 
  },
  placeholderImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  registerText2: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#222", 
    marginBottom: 12,
    textAlign: "center"
  },
  registerButton: { 
    backgroundColor: "#e53935", 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8 
  },
  registerButtonText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 16 
  },

  // Donate Section
  donateSection: { 
    margin: 16, 
    alignItems: "center" 
  },
  donateImageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  donateImage: {
    width: "100%",
    height: "100%",
  },
  donateButton: {
    backgroundColor: "#FFEB3B",
    paddingVertical: 12,
    width: "100%",
    borderRadius: 8,
    alignItems: "center",
  },
  donateButtonText: { 
    fontWeight: "bold", 
    fontSize: 18, 
    color: "#222" 
  },

  // Footer
  footer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    padding: 16, 
    alignItems: "center" 
  },
  footerIcons: { 
    flexDirection: "row", 
    gap: 12 
  },
})