import NetInfo from "@react-native-community/netinfo";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../screens/firebaseconfig";
import { getSecureData, deleteSecureData } from "./secureStorage";
import { Alert, Platform } from "react-native";

/**
 * Inicia la escucha para sincronizar borradores cuando vuelve la conexión.
 * Devuelve la función unsubscribe.
 */
export function startFormSyncListener() {
  console.log("[SyncService] Iniciando listener de sincronización...");
  const unsubscribe = NetInfo.addEventListener(async (state) => {
    console.log(`[SyncService] Cambio conexión: isConnected=${state.isConnected}`);
    if (state.isConnected) {
      await trySyncDraft();
    }
  });

  // Intentar sincronizar una vez al iniciar
  trySyncDraft().catch(err => console.log("[SyncService] Error inicial sync:", err));
  return unsubscribe;
}

/**
 * Función para sincronizar borrador de forma segura.
 */
export async function trySyncDraft() {
  console.log("[SyncService] Intentando sincronizar borrador...");
  try {
    const draft = await getSecureData("socioFormDraft");
    if (!draft) {
      console.log("[SyncService] ✅ No hay borrador pendiente.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      console.warn("[SyncService] ⚠️ No hay usuario autenticado. No se puede sincronizar.");
      return;
    }

    const formObj = typeof draft === "string" ? JSON.parse(draft) : draft;

    await addDoc(collection(db, "socioNutritionalForms"), {
      userId: user.uid,
      ...formObj,
      submittedAt: new Date(),
      status: "Pendiente de revisión (auto-sync)"
    });

    await deleteSecureData("socioFormDraft");

    console.log("[SyncService] ✅ Borrador sincronizado y eliminado localmente.");

    // Mostrar alerta al usuario si la app está en foreground
    if (Platform.OS !== "web") {
      Alert.alert(
        "Sincronización exitosa",
        "Tu formulario guardado offline se ha sincronizado correctamente."
      );
    }

  } catch (error) {
    console.error("[SyncService] ❌ Error sincronizando borrador:", error);
  }
}
