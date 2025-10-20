import type React from "react"
import { View, Text, StyleSheet, Pressable, ScrollView, Image, ImageBackground } from "react-native"
import { FontAwesome5, Feather, Ionicons } from "@expo/vector-icons"
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con gradiente */}
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
          <Pressable 
            onPress={() => navigation.navigate("Login")} 
            style={styles.loginButton}
          >
            <Ionicons name="person" size={20} color="#fff" />
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </Pressable>
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

      {/* Statistics Section Mejorado */}
      <View style={styles.statsSection}>
        <View style={styles.statsSectionHeader}>
          <View style={styles.statsTitleContainer}>
            <Ionicons name="stats-chart" size={28} color="#E53E3E" />
            <Text style={styles.statsSectionTitle}>Nuestro Impacto</Text>
          </View>
          <Text style={styles.statsSectionSubtitle}>
            Transformando vidas día a día
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

          <View style={[styles.statCard, styles.statCardBlue]}>
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

          <View style={[styles.statCard, styles.statCardOrange]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="business" size={32} color="#fff" />
            </View>
            <Text style={styles.statNumber}>155</Text>
            <Text style={styles.statLabel}>Instituciones atendidas</Text>
          </View>
        </View>
      </View>

      {/* Registration CTA Mejorado */}
      <View style={styles.registerSection}>
        <View style={styles.registerImageContainer}>
          <Image 
            style={styles.registerImage} 
            source={{
              uri: "https://charities2love.org/wp-content/uploads/2023/08/food-bank-volunteer.jpg",
            }}
          />
          <View style={styles.registerImageOverlay}>
            <Ionicons name="heart" size={48} color="#fff" />
          </View>
        </View>
        
        <View style={styles.registerContent}>
          <Text style={styles.registerTitle}>¡Únete a nosotros!</Text>
          <Text style={styles.registerText}>
            Si quieres formar parte de esta comunidad y hacer la diferencia
          </Text>
          
          <Pressable 
            style={styles.registerButton} 
            onPress={() => navigation.navigate("UserTypeScreen")}
          >
            <Ionicons name="person-add" size={20} color="#fff" />
            <Text style={styles.registerButtonText}>Regístrate ahora</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
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
        </View>
        
        <Text style={styles.donateDescription}>
          Tu apoyo nos ayuda a llevar alimento a quienes más lo necesitan
        </Text>
        
        <Pressable 
          style={styles.donateButton}
          onPress={() => Linking.openURL('https://bdalimentos.org/make-a-donation/?cause_id=8492')}
        >
          <Ionicons name="heart" size={22} color="#92400E" />
          <Text style={styles.donateButtonText}>Donar ahora</Text>
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
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E53E3E",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#E53E3E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  // Hero Section
  heroSection: { 
    margin: 20,
    marginTop: 10,
  },
  heroImage: { 
    width: "100%", 
    height: 400,
    justifyContent: "flex-end",
  },
  heroImageStyle: {
    borderRadius: 24,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
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
  heroDescription: {
    fontSize: 16,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginTop: 4,
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
  statCardBlue: {
    backgroundColor: "#3B82F6",
  },
  statCardGreen: {
    backgroundColor: "#10B981",
  },
  statCardOrange: {
    backgroundColor: "#F59E0B",
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

  // Register Section
  registerSection: { 
    margin: 20, 
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  registerImageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
  },
  registerImage: {
    width: "100%",
    height: "100%",
  },
  registerImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(229, 62, 62, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  registerContent: {
    padding: 24,
    alignItems: "center",
  },
  registerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  registerText: { 
    fontSize: 15, 
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  registerButton: { 
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E53E3E",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 10,
    shadowColor: "#E53E3E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  registerButtonText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 18,
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