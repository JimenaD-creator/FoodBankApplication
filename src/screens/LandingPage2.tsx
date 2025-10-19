import type React from "react"
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from "react-native"
import { FontAwesome5, Feather } from "@expo/vector-icons"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../App"
import { Linking } from 'react-native';

type LandingNavigationProp = NativeStackNavigationProp<RootStackParamList, "Landing">

interface LandingPageProps {
  navigation: LandingNavigationProp
}

const LandingPage: React.FC<LandingPageProps> = ({ navigation }) => {
  const heroImageSource = {
    uri: "https://cdn.milenio.com/uploads/media/2023/05/22/banco-alimentos-ubica-santa-maria.jpg",
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image style={styles.logoIm} source={require('../../assets/logo_no_background.png')} // Añadí require()
/>
        <View style={styles.headerIcons}>
          <Pressable onPress={() => navigation.navigate("Login")} style={styles.iconButton}>
            <FontAwesome5 name="user" size={24} color="#444" />
          </Pressable>
          
        </View>
      </View>

      {/* Alert Banner */}
      

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image source={heroImageSource} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroText}>Entre todos,{"\n"}hacemos más mesas.</Text>
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
      <View style={styles.registerSection}>
        
          <Image style={styles.placeholderImage} source={{
              uri: "https://charities2love.org/wp-content/uploads/2023/08/food-bank-volunteer.jpg",
            }}/>
       
        <Text style={styles.registerText2}>Si quieres formar parte de esta comunidad</Text>
        <Pressable style={styles.registerButton} onPress={() => navigation.navigate("UserTypeScreen")}>
          <Text style={styles.registerButtonText}>Registrate</Text>
        </Pressable>
      </View>

     

      {/* Donate Section */}
      <View style={styles.donateSection}>
        <View style={styles.placeholderImage}>
          <Image
            source={{
              uri: "https://www.daysoftheyear.com/cdn-cgi/image/dpr=1%2Cf=auto%2Cfit=cover%2Ch=1331%2Cq=85%2Cw=2000/wp-content/uploads/international-day-of-charity-1.jpg",
            }}
            style={styles.placeholderImage}
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
        <Image style={styles.logoIm} source={require('../../assets/logo_no_background.png')} // Añadí require()
/>
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
  header: { flexDirection: "row", justifyContent: "space-between", padding: 16, alignItems: "center", paddingTop: 30 },
  logo: { fontSize: 24, fontWeight: "bold" },
  headerIcons: { flexDirection: "row", gap: 12 },
  iconButton: { padding: 8 },

  alertBanner: { backgroundColor: "#FFF9C4", padding: 12 },
  alertText: { color: "#F57F17", textAlign: "center" },

  heroSection: { position: "relative", marginVertical: 16, marginHorizontal: 16 },
  heroImage: { width: "100%", height: 300, borderRadius: 12 },
  heroTextContainer: { position: "absolute", bottom: 16, left: 16 },
  heroText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },

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
  logoIm: {
    width: 90,
    height: 60,
    resizeMode: 'contain',
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

  registerSection: { margin: 16, padding: 16, backgroundColor: "#FFF9C4", borderRadius: 12, alignItems: "center" },
  placeholderImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { color: "#666", fontSize: 14 },
  registerText1: { fontSize: 16, color: "#444" },
  registerText2: { fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 12 },
  registerButton: { backgroundColor: "#e53935", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  registerButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  noticeSection: { margin: 16 },
  noticeCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  noticeTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
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
  noticeIconText: { color: "#fff", fontSize: 28 },
  noticeContent: { textAlign: "center", color: "#555", marginBottom: 12 },
  noticeFooter: { textAlign: "center", fontWeight: "bold", color: "#222" },

  donateSection: { margin: 16, alignItems: "center" },
  donateButton: {
    backgroundColor: "#FFEB3B",
    paddingVertical: 12,
    width: "100%",
    borderRadius: 8,
    alignItems: "center",
  },
  donateButtonText: { fontWeight: "bold", fontSize: 18, color: "#222" },

  footer: { flexDirection: "row", justifyContent: "space-between", padding: 16, alignItems: "center" },
  footerLogo: { fontWeight: "bold", fontSize: 20 },
  footerIcons: { flexDirection: "row", gap: 12 },
})
