import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/screens/firebaseconfig'; // ✅ QUITAR Firestore

// Importaciones de pantallas
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import UserTypeScreen from './src/screens/chooseProfile';
import AdminDashboard from './src/screens/Admin/AdminDashboard';
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
import BeneficiaryStudyScreen from './src/screens/Admin/BeneficiaryStudyScreen';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { startFormSyncListener } from './src/services/syncService';

ExpoSplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = startFormSyncListener();
    
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('✅ Auth state cambiado - INSTANTÁNEO');
      setUser(user); // ✅ SOLO esto - INSTANTÁNEO
      setLoading(false);
      ExpoSplashScreen.hideAsync();
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Profile" component={UserTypeScreen} />
        
        {!user ? (
          // Usuario NO autenticado
          <>
            <Stack.Screen name="Registrar" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="StaffDashboard" component={StaffDashboard} />
            <Stack.Screen name="BeneficiaryDashboard" component={BeneficiaryDashboard} />
            <Stack.Screen name="BeneficiariesList" component={BeneficiariesList} />
            <Stack.Screen name="DeliveriesList" component={DeliveryListScreen}/>
            <Stack.Screen name="StandardTemplate" component={StandardTemplateScreen} />
            <Stack.Screen name="CommunitiesManagement" component={CommunitiesManagementScreen} />
            <Stack.Screen name="DeliveryManagement" component={DeliveryManagementScreen} />
            <Stack.Screen name="SocioEconomicSurvey" component={SocioEconomicSurvey} />
            <Stack.Screen name="DeliveryQR" component={DeliveryQR} />
            <Stack.Screen name="PreStudyForm" component={PreStudyForm} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="StaffList" component={StaffList}/>
            <Stack.Screen name="DeliveryDetails" component={DeliveryDetails} />
            <Stack.Screen name="DeliveryHistory" component={DeliveryHistoryScreen} />
            <Stack.Screen name="BeneficiaryAttendance" component={DeliveryAssistanceScreen}/>
            <Stack.Screen name="BeneficiaryStudyScreen" component={BeneficiaryStudyScreen}/>
            <Stack.Screen name="Unauthorized" component={UnauthorizedScreen} />
          </>
        )}
        
      </Stack.Navigator>
    </NavigationContainer>
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