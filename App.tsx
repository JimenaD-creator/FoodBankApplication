// App.tsx
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './src/screens/firebaseconfig';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { startFormSyncListener } from './src/services/syncService';
import { UserRoleProvider } from "./src/hooks/UserContext";
import { ActiveTabProvider } from "./src/hooks/ActiveTabContext";
import { AssignedDelivery } from './src/screens/Volunteer/StaffDashboard';
// Screens
import LoginScreen from "./src/screens/LoginScreen";
import LandingScreen from "./src/screens/LandingPage2";
import RegisterScreen from "./src/screens/RegisterScreen";
import UserTypeScreen from './src/screens/chooseProfile';
import AdminDashboard from './src/screens/Admin/AdminDashboard';
import Landing2 from './src/screens/Landing3';

import BeneficiaryDashboard from './src/screens/Beneficiary/BeneficiaryDashboard';
import BeneficiariesList from './src/screens/Admin/BeneficiariesList';
import ProfileScreen from './src/screens/InfoProfile';
import StandardTemplateScreen from './src/screens/Admin/StandardTemplate';
import CommunitiesManagementScreen from './src/screens/Admin/CommunitiesManagement';
import DeliveryManagementScreen from './src/screens/Admin/DeliveryManagement';
import DeliveryDetails from './src/screens/DeliveryDetails';
import DeliveryQR from './src/screens/Beneficiary/DeliveryQR';
import StaffDashboard from './src/screens/Volunteer/StaffDashboard';
import PreStudyForm from './src/screens/Beneficiary/PreStudyForm';
import SocioEconomicSurvey from './src/screens/Volunteer/SocioEconomicSurvey';
import SplashScreen from './src/screens/SplashScreen';
import StaffList from './src/screens/Admin/StaffList';
import UnauthorizedScreen from './src/screens/UnauthorizedScreen';
import DeliveryListScreen from './src/screens/Admin/DeliveriesList';
import DeliveryHistoryScreen from './src/screens/DeliveryHistory';
import DeliveryAssistanceScreen from './src/screens/Admin/BeneficiaryAttendance';
import StaffBeneficiariesList from './src/screens/Volunteer/StaffBeneficiariesList';
import StaffDelivery from './src/screens/Volunteer/StaffDelivery';
import ScannerQR from './src/screens/Volunteer/ScannerQR';
import BeneficiaryStudyScreen from './src/screens/Admin/BeneficiaryStudyScreen';
import EditScreen from './src/screens/Admin/EditNoticeScreen';

import PrivacyPolicyScreen from "./src/screens/PrivacyPolicyScreen";
import MainContainer from "./src/screens/MainContainer";
import LayoutNavBar from '@/screens/LayoutNavBar';
import EditNoticeScreen from './src/screens/Admin/EditNoticeScreen';


ExpoSplashScreen.preventAutoHideAsync();

export type RootStackParamList = {
  Splash: undefined;
  Landing: undefined;
  Login: undefined;
  ScannerQR:undefined;
  Profile: undefined;
  Registrar: { userType?: string; isFromAdminDashboard?: boolean } | undefined;

  ForgotPassword: undefined;
  AdminDashboard: undefined;
  BeneficiariesList: undefined;
  StandardTemplate: undefined;
  CommunitiesManagement: undefined;
  DeliveryManagement: undefined;
  DeliveryQR: undefined;
  BeneficiaryDashboard: undefined;
  DeliveryDetails: { delivery: Delivery };

  DeliveryHistory: undefined;
  ProfileScreen: undefined;
  StaffDashboard: undefined;

  UserTypeScreen: undefined;
  PreStudyForm: undefined;
  SocioEconomicSurvey: undefined;
  PrivacyPolicyScreen: {
    requireAcceptance?: boolean;
    onAccept?: () => void;
  };
  StaffList: undefined;
  EditNoticeScreen: undefined;
  DeliveriesList: undefined;
  Landing2:undefined;
  BeneficiaryAttendance: undefined;
  StaffBeneficiariesList:undefined;
  StaffDelivery: { delivery: AssignedDelivery }; // <-- Change 'undefined' to the correct params object
  BeneficiaryStudyScreen: undefined;
  Unauthorized: undefined;
  Main: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Stack = createNativeStackNavigator<RootStackParamList>();
export interface Delivery {
  id: string
  communityName: string
  municipio: string
  deliveryDate: any
  volunteers: { id: string; name: string }[]
  products: any
  beneficiary: { id: string }
  status: "Programada" | "En camino" | "Completada"
}
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = startFormSyncListener();

    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('✅ Auth state changed');
      setUser(firebaseUser);
      setLoading(false);
      ExpoSplashScreen.hideAsync();
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <UserRoleProvider>
      <ActiveTabProvider>

    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Landing is always first */}
        <Stack.Screen name="Landing" component={LandingScreen} />

        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Registrar" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={RegisterScreen} />
            <Stack.Screen name="UserTypeScreen" component={UserTypeScreen} />

          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainContainer} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="Registrar" component={RegisterScreen} />
            <Stack.Screen name="StaffDashboard" component={StaffDashboard} />
            <Stack.Screen name="BeneficiaryDashboard" component={BeneficiaryDashboard} />
            <Stack.Screen name="BeneficiariesList" component={BeneficiariesList} />
            <Stack.Screen name="DeliveriesList" component={DeliveryListScreen} />
            <Stack.Screen name="StandardTemplate" component={StandardTemplateScreen} />
            <Stack.Screen name="CommunitiesManagement" component={CommunitiesManagementScreen} />
            <Stack.Screen name="DeliveryManagement" component={DeliveryManagementScreen} />
            <Stack.Screen name="SocioEconomicSurvey" component={SocioEconomicSurvey} />
            <Stack.Screen name="DeliveryQR" component={DeliveryQR} />
            <Stack.Screen name="PreStudyForm" component={PreStudyForm} />
            <Stack.Screen name="Landing2" component={Landing2} />


            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="EditScreen" component={EditNoticeScreen} />

            <Stack.Screen name="StaffList" component={StaffList} />
            <Stack.Screen name="DeliveryDetails" component={DeliveryDetails} />
            <Stack.Screen name="DeliveryHistory" component={DeliveryHistoryScreen} />
            <Stack.Screen name="BeneficiaryAttendance" component={DeliveryAssistanceScreen} />
            <Stack.Screen name="BeneficiaryStudyScreen" component={BeneficiaryStudyScreen} />
            <Stack.Screen name="Unauthorized" component={UnauthorizedScreen} />
            <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
            <Stack.Screen name = "StaffBeneficiariesList" component={StaffBeneficiariesList} />
            <Stack.Screen name = "StaffDelivery" component={StaffDelivery} />
            <Stack.Screen name = "ScannerQR" component={ScannerQR} />

            
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
     </ActiveTabProvider>

    </UserRoleProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
});
