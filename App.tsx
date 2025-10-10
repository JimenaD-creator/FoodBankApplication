import { StyleSheet} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import SplashScreen from './src/screens/SplashScreen';
import UserTypeScreen from './src/screens/chooseProfile';
import AdminDashboard from './src/screens/Admin/AdminDashboard';
import BeneficiariesList from './src/screens/Admin/BeneficiariesList';
import ProfileScreen from './src/screens/InfoProfile';
<<<<<<< Updated upstream
=======
import StandardTemplateScreen from './src/screens/Admin/StandardTemplate';
import CommunitiesManagementScreen from './src/screens/Admin/CommunitiesManagement';
import DeliveryManagementScreen from './src/screens/Admin/DeliveryManagement';
import DeliveryDetails from './src/screens/DeliveryDetails';
import DeliveryQR from './src/screens/Beneficiary/DeliveryQR';
import StaffDashboard from './src/screens/Volunteer/StaffDashboard';
import StaffDelivery from './src/screens/Volunteer/StaffDelivery';
import QRScanner from './src/screens/Volunteer/ScannerQR';
import PreStudyForm from './src/screens/Beneficiary/PreStudyForm';
import SocioEconomicSurvey from './src/screens/Volunteer/SocioEconomicSurvey';
import * as ExpoSplashScreen from 'expo-splash-screen';
import SplashScreen from './src/screens/SplashScreen';
import { useEffect } from 'react'; 
import DeliveryHistoryScreen from './src/screens/DeliveryHistory';
import ScannerQR from './src/screens/Volunteer/ScannerQR';
>>>>>>> Stashed changes

import StaffDashboard from './src/screens/Staff/StaffDashboard';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Profile" component={UserTypeScreen}/>
        <Stack.Screen name="Registrar" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={RegisterScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="BeneficiariesList" component={BeneficiariesList} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
<<<<<<< Updated upstream

        <Stack.Screen name="StaffDashboard" component = {StaffDashboard} />


=======
        <Stack.Screen name="StaffDashboard" component={StaffDashboard}/>
        <Stack.Screen name="PreStudyForm" component={PreStudyForm}/>
        <Stack.Screen name="SocioEconomicSurvey" component={SocioEconomicSurvey}/>
        <Stack.Screen name = "StaffDelivery" component = { StaffDelivery } />
        <Stack.Screen name = "ScannerQR" component = { ScannerQR } />
>>>>>>> Stashed changes
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
