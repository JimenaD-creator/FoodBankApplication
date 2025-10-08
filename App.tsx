import { StyleSheet} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import DeliveryDetails from './src/screens/Beneficiary/DeliveryDetails';
import DeliveryQR from './src/screens/Beneficiary/DeliveryQR';
import * as ExpoSplashScreen from 'expo-splash-screen';
import SplashScreen from './src/screens/SplashScreen';
import { useEffect } from 'react'; 

ExpoSplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
   useEffect(() => {
    // Ocultar el splash nativo
    ExpoSplashScreen.hideAsync();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" 
          component={SplashScreen} 
          options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Profile" component={UserTypeScreen}/>
        <Stack.Screen name="Registrar" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={RegisterScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="BeneficiariesList" component={BeneficiariesList} />
        <Stack.Screen name="StandardTemplate" component={StandardTemplateScreen} />
        <Stack.Screen name="CommunitiesManagement" component={CommunitiesManagementScreen} />
        <Stack.Screen name="DeliveryManagement" component={DeliveryManagementScreen} />
        <Stack.Screen name="DeliveryQR" component={DeliveryQR}/>
        <Stack.Screen name="BeneficiaryDashboard" component={BeneficiaryDashboard}/>
        <Stack.Screen name="DeliveryDetails" component={DeliveryDetails}/>
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />




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
