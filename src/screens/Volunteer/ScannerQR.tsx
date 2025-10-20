import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, Animated, Easing, TouchableOpacity } from 'react-native';
import { Camera, CameraView, BarcodeScanningResult } from 'expo-camera';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebaseconfig';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface Delivery {
  id: string;
  communityName: string;
  municipio: string;
  deliveryDate: any;
  products: { [productId: string]: { quantity: number } };
  status: string;
  beneficiary: {
    id: string;
    qrCode: string;
    name: string;
  }
}

type RootStackParamList = {
  QrScanner: { delivery: Delivery };
};

type QrScannerRouteProp = RouteProp<RootStackParamList, 'QrScanner'>;

export default function ScannerQR() {
  const route = useRoute<QrScannerRouteProp>();
  const { delivery } = route.params;
  const navigation = useNavigation();

  console.log("🔍 QR esperado:", delivery.beneficiary.qrCode);
  console.log("📦 Entrega ID:", delivery.id);
  console.log("👤 Beneficiario:", delivery.beneficiary.name);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

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

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
  if (scanned) return;
  setScanned(true);

  const { data } = result;
  
  console.log("=== DEBUG QR SCANNER ===");
  console.log("📱 QR ESCANEADO:", data);
  console.log("🎯 QR ESPERADO:", delivery.beneficiary.qrCode);
  console.log("✅ ¿Son iguales?:", data === delivery.beneficiary.qrCode);

  // Comparación directa
  if (data === delivery.beneficiary.qrCode) {
    console.log("✅ QR COINCIDE - Marcando como entregada");
    await marcarComoEntregado();
  } else {
    // Buscar en TODAS las entregas del beneficiario por el QR escaneado
    console.log("🔍 Buscando entrega con QR escaneado en todas las entregas del beneficiario...");
    
    try {
      const deliveriesQuery = query(
        collection(db, "scheduledDeliveries"),
        where("beneficiary.id", "==", delivery.beneficiary.id)
      );
      
      const deliveriesSnapshot = await getDocs(deliveriesQuery);
      let matchingDelivery = null;
      
      deliveriesSnapshot.forEach((doc) => {
        const deliveryData = doc.data();
        if (deliveryData.beneficiary?.qrCode === data) {
          matchingDelivery = { id: doc.id, ...deliveryData };
        }
      });
      
      if (matchingDelivery) {
        console.log("✅ ENCONTRADA ENTREGA CON QR COINCIDENTE:", matchingDelivery.id);
        // Actualizar la entrega que coincide con el QR
        await updateDoc(doc(db, 'scheduledDeliveries', matchingDelivery.id), { 
          status: 'Entregado',
          redeemed: true,
          deliveredAt: new Date()
        });
        
        Alert.alert(
          '✅ Entrega registrada', 
          `La despensa para ${matchingDelivery.beneficiary.name} ha sido marcada como entregada.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          '❌ Código QR no coincide', 
          `El QR escaneado no corresponde a ninguna entrega de ${delivery.beneficiary.name}.`,
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
      }
    } catch (error) {
      console.error('Error buscando entrega:', error);
      Alert.alert(
        '❌ Error', 
        'No se pudo verificar el código QR.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  }
};

  const marcarComoEntregado = async () => {
    try {
      const deliveryRef = doc(db, 'scheduledDeliveries', delivery.id);
      
      await updateDoc(deliveryRef, { 
        status: 'Entregado',
        redeemed: true,
        deliveredAt: new Date()
      });
      
      Alert.alert(
        '✅ Entrega registrada', 
        `La despensa para ${delivery.beneficiary.name} ha sido marcada como entregada.`,
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    } catch (error) {
      console.error('Error al actualizar el delivery:', error);
      Alert.alert(
        '❌ Error', 
        'No se pudo actualizar el estado en la base de datos.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Solicitando permiso de cámara...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No se concedió acceso a la cámara.</Text>
        <Button title="Intentar de nuevo" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
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
            <Animated.View
              style={[
                styles.scanningLine,
                { transform: [{ translateY }] }
              ]}
            />
          </View>

          <View style={styles.maskSide} />
        </View>
        <View style={styles.maskBottom} />
      </View>

      {/* Info Card con QR esperado */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Escaneando código QR</Text>
        <Text style={styles.infoText}>Beneficiario: {delivery.beneficiary.name}</Text>
        <Text style={styles.infoText}>Comunidad: {delivery.communityName}</Text>
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
  container: { 
    flex: 1 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E53E3E',
    marginBottom: 20,
    textAlign: 'center',
  },

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
  scanningLine: {
    height: 2,
    backgroundColor: '#4CAF50',
    width: '100%',
  },

  // Info Card
  infoCard: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 4,
  },

  bottomButtonContainer: {
    position: 'absolute',
    bottom: 40,
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