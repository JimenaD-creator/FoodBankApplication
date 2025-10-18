"use client"

import { StyleSheet } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator, type NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useEffect } from "react"
import * as ExpoSplashScreen from "expo-splash-screen"

// Screens
import LoginScreen from "./src/screens/LoginScreen"
import RegisterScreen from "./src/screens/RegisterScreen"
import UserTypeScreen from "./src/screens/chooseProfile"
import AdminDashboard from "./src/screens/Admin/AdminDashboard"
import BeneficiaryDashboard from "./src/screens/Beneficiary/BeneficiaryDashboard"
import BeneficiariesList from "./src/screens/Admin/BeneficiariesList"
import ProfileScreen from "./src/screens/InfoProfile"
import StandardTemplateScreen from "./src/screens/Admin/StandardTemplate"
import CommunitiesManagementScreen from "./src/screens/Admin/CommunitiesManagement"
import DeliveryManagementScreen from "./src/screens/Admin/DeliveryManagement"
import DeliveryDetails from "./src/screens/DeliveryDetails"
import DeliveryQR from "./src/screens/Beneficiary/DeliveryQR"
import StaffDashboard from "./src/screens/Volunteer/StaffDashboard"
import StaffDelivery from "./src/screens/Volunteer/StaffDelivery"
import ScannerQR from "./src/screens/Volunteer/ScannerQR"
import StaffNotApproved from "./src/screens/Volunteer/StaffNotApproved"
import StaffBeneficiariesList from "./src/screens/Volunteer/StaffBeneficiariesList"
import PreStudyForm from "./src/screens/Beneficiary/PreStudyForm"
import SocioEconomicSurvey from "./src/screens/Volunteer/SocioEconomicSurvey"
import SplashScreen from "./src/screens/SplashScreen"
import DeliveryHistoryScreen from "./src/screens/DeliveryHistory"
import PrivacyPolicyScreen from "./src/screens/PrivacyPolicyScreen"

ExpoSplashScreen.preventAutoHideAsync()

export type RootStackParamList = {
  Splash: undefined
  Login: undefined
  Profile: undefined
  Registrar: undefined
  ForgotPassword: undefined
  AdminDashboard: undefined
  BeneficiariesList: undefined
  StandardTemplate: undefined
  CommunitiesManagement: undefined
  DeliveryManagement: undefined
  DeliveryQR: undefined
  BeneficiaryDashboard: undefined
  DeliveryDetails: undefined
  DeliveryHistory: undefined
  ProfileScreen: undefined
  StaffDashboard: undefined
  PreStudyForm: undefined
  SocioEconomicSurvey: undefined
  PrivacyPolicyScreen: {
    requireAcceptance?: boolean
    onAccept?: () => void
  }
}

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>

const Stack = createNativeStackNavigator<RootStackParamList>()

function MainApp() {
  useEffect(() => {
    // Hide native splash
    ExpoSplashScreen.hideAsync()
  }, [])

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Profile" component={UserTypeScreen} />
      <Stack.Screen name="Registrar" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={RegisterScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="BeneficiariesList" component={BeneficiariesList} />
      <Stack.Screen name="StandardTemplate" component={StandardTemplateScreen} />
      <Stack.Screen name="CommunitiesManagement" component={CommunitiesManagementScreen} />
      <Stack.Screen name="DeliveryManagement" component={DeliveryManagementScreen} />
      <Stack.Screen name="DeliveryQR" component={DeliveryQR} />
      <Stack.Screen name="BeneficiaryDashboard" component={BeneficiaryDashboard} />
      <Stack.Screen name="DeliveryDetails" component={DeliveryDetails} />
      <Stack.Screen name="DeliveryHistory" component={DeliveryHistoryScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="StaffDashboard" component={StaffDashboard} />
      <Stack.Screen name="StaffDelivery" component={StaffDelivery} />
      <Stack.Screen name="ScannerQR" component={ScannerQR} />
      <Stack.Screen name="StaffNotApproved" component = {StaffNotApproved} />
      <Stack.Screen name="StaffBeneficiariesList" component = {StaffBeneficiariesList} />
      <Stack.Screen name="PreStudyForm" component={PreStudyForm} />
      <Stack.Screen name="SocioEconomicSurvey" component={SocioEconomicSurvey} />
      <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <MainApp />
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
})
