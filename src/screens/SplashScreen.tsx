import {useEffect} from "react";
import {View, Text, Image, StyleSheet, ViewBase} from "react-native";

export default function SplashScreen({navigation}: any){
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace("Login");
        }, 2000);
        return () => clearTimeout(timer);
    }, [navigation]);

    return(
        <View style={styles.container}>
            <Image source={require("../../assets/splash_1.png")} style={styles.logo}/>
            <Text style={styles.text}>Cargando...</Text>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: "#333",
  },

})

