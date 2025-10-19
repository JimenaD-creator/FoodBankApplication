import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { Camera, CameraView, CameraType, BarcodeScanningResult } from 'expo-camera';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';

import {auth, db} from '../firebaseconfig';
import { doc, updateDoc } from "firebase/firestore";

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

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async (result: BarCodeScanningResult) => {
    if (scanned) return;
    setScanned(true);

    const { data } = result;

    if (data === delivery.id) {
      await marcarComoEntregado();
    } else {
      Alert.alert(
        "❌",
        `Vuelva a intentar a escanear el QR`
      );
    }
  };


  const marcarComoEntregado = async () => {
    try {
      const deliveryRef = doc(db, "scheduledDeliveries", delivery.id);
      await updateDoc(deliveryRef, { status: "Entregado" });
      Alert.alert('✅', 'El Status de la Entrega se ha Actualizado');;
    } catch (error) {
      console.error("Error al actualizar el delivery:", error);
      Alert.alert("❌ Error", "No se pudo actualizar el estado en FireBase.");
    }
  };

  if (hasPermission === null) {
    return <Text>Solicitando permiso de cámara...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No se concedió acceso a la cámara.</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      {scanned && (
        <View style={styles.overlay}>
          <Button title="Escanear de nuevo" onPress={() => setScanned(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});