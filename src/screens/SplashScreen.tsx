import {useEffect} from "react";
import {View, Text, Image, StyleSheet, ViewBase, ImageBackground, ActivityIndicator} from "react-native";

export default function SplashScreen({navigation}: any){
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace("Login");
        }, 2000);
        return () => clearTimeout(timer);
    }, [navigation]);

    return(

      <ImageBackground
      source={require("../../assets/background.jpg")} 
      style={styles.container}
      resizeMode="cover"
    >
      {/* Overlay blanco semitransparente */}
      <View style={styles.overlay} />

        <View style={styles.container}>
            <Image source={require("../../assets/logo_no_background.png")} style={styles.logo}/>
            {/* Spinner de carga */}
        <ActivityIndicator 
          size="large" 
          color="#E53E3E" 
          style={styles.spinner}
        />
        </View>
        </ImageBackground>
    )
}
const styles = StyleSheet.create({
    container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
    overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.35)', // Fondo blanco semitransparente
  },
  logo: {
    width: 200,
    height: 200,
  },
  spinner: {
    marginTop: 20,
  },

})

