import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, Animated, Easing, TouchableOpacity } from 'react-native';
import { Camera, CameraView, BarcodeScanningResult } from 'expo-camera';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebaseconfig';
import { doc, updateDoc } from 'firebase/firestore';

interface Delivery {
  id: string;
  communityName: string;
  municipio: string;
  deliveryDate: any;
  products: { [productId: string]: { quantity: number } };
  status: string;
}

type RootStackParamList = {
  QrScanner: { delivery: Delivery };
};

type QrScannerRouteProp = RouteProp<RootStackParamList, 'QrScanner'>;

export default function ScannerQR() {
  const route = useRoute<QrScannerRouteProp>();
  const { delivery } = route.params;
  const navigation = useNavigation();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Simple scanning line animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animation]);

  const handleBarCodeScanned = async (result: c) => {
    if (scanned) return;
    setScanned(true);

    const { data } = result;
    if (data === delivery.id) {
      await marcarComoEntregado();
    } else {
      Alert.alert('❌', 'El código QR no coincide, inténtelo nuevamente.');
    }
  };

  const marcarComoEntregado = async () => {
    try {
      const deliveryRef = doc(db, 'scheduledDeliveries', delivery.id);
      await updateDoc(deliveryRef, { status: 'Entregado' });
      Alert.alert('✅', 'El Status de la Entrega se ha Actualizado');
    } catch (error) {
      console.error('Error al actualizar el delivery:', error);
      Alert.alert('❌ Error', 'No se pudo actualizar el estado en FireBase.');
    }
  };

  if (hasPermission === null) {
    return <Text>Solicitando permiso de cámara...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No se concedió acceso a la cámara.</Text>;
  }

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // scanning line moves vertically inside the frame
  });

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Overlay UI */}
      <View style={styles.overlay}>
        <View style={styles.maskTop} />
        <View style={styles.middleRow}>
          <View style={styles.maskSide} />

          {/* Scanning Frame */}
          <View style={styles.frame}>
          </View>

          <View style={styles.maskSide} />
        </View>
        <View style={styles.maskBottom} />
      </View>

      {scanned && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={() => setScanned(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Escanear de nuevo</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Layout layers
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maskTop: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  middleRow: {
    flexDirection: 'row',
  },
  maskSide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  maskBottom: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  // Scanner frame
  frame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },

  bottomButtonContainer: {
    position: 'absolute',
    bottom: 40,           // Adjust if needed (e.g. 60 for taller phones)
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitButton: { 
    backgroundColor: "#4CAF50", 
    paddingVertical: 14, 
    paddingHorizontal: 60,
    borderRadius: 8, 
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  submitButtonText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 16, 
    letterSpacing: 0.5,
  },


});
