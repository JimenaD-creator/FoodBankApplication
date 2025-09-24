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
import BeneficiaryDashboard from './src/screens/Beneficiary/BeneficiaryDashboard';

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
        <Stack.Screen name="BeneficiaryDashboard" component={BeneficiaryDashboard} />



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
