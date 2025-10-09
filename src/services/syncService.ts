// syncService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './../screens/firebaseconfig';

/**
 * Guarda temporalmente una acción local (entrega, registro, etc.)
 * si no hay conexión a internet.
 */
export const saveOfflineAction = async (actionType: string, payload: any) => {
  try {
    const existingQueue = JSON.parse(await AsyncStorage.getItem('offlineQueue') || '[]');
    existingQueue.push({ actionType, payload, timestamp: Date.now() });
    await AsyncStorage.setItem('offlineQueue', JSON.stringify(existingQueue));
    console.log('Acción guardada offline:', actionType);
  } catch (error) {
    console.error('Error guardando acción offline:', error);
  }
};

/**
 * Intenta sincronizar las acciones guardadas localmente con Firebase
 * cuando el dispositivo vuelve a tener conexión.
 */
export const syncOfflineActions = async () => {
  try {
    const connection = await NetInfo.fetch();

    if (!connection.isConnected) {
      console.log('Sin conexión, no se puede sincronizar aún');
      return;
    }

    const queueString = await AsyncStorage.getItem('offlineQueue');
    if (!queueString) return;

    const queue = JSON.parse(queueString);

    for (const item of queue) {
      switch (item.actionType) {
        case 'delivery':
          await addDoc(collection(db, 'deliveriesLog'), {
            ...item.payload,
            syncedAt: serverTimestamp(),
          });
          break;
        case 'beneficiary_registration':
          await addDoc(collection(db, 'beneficiaries'), {
            ...item.payload,
            createdAt: serverTimestamp(),
          });
          break;
        default:
          console.warn('Tipo de acción no reconocido:', item.actionType);
      }
    }

    // Limpia la cola una vez sincronizado
    await AsyncStorage.removeItem('offlineQueue');
    console.log('✅ Sincronización completada');

  } catch (error) {
    console.error('Error sincronizando acciones offline:', error);
  }
};

/**
 * Escucha automáticamente los cambios de conexión.
 */
export const startSyncListener = () => {
  NetInfo.addEventListener(state => {
    if (state.isConnected) {
      console.log('📶 Conexión detectada, iniciando sincronización...');
      syncOfflineActions();
    }
  });
};
