import * as SecureStore from "expo-secure-store";

export async function saveSecureData(key: string, value: any): Promise<boolean> {
  try {
    const str = typeof value === "string" ? value : JSON.stringify(value);
    await SecureStore.setItemAsync(key, str, { keychainService: "foodbank_credentials" });
    console.log(`[SecureStore] ✅ Guardado key="${key}" con valor:`, str);
    return true;
  } catch (error) {
    console.error(`[SecureStore] ❌ Error guardando key="${key}":`, error);
    return false;
  }
}

export async function getSecureData(key: string): Promise<any | null> {
  try {
    const str = await SecureStore.getItemAsync(key, { keychainService: "foodbank_credentials" });
    if (!str) {
      console.log(`[SecureStore] ℹ️ No existe key="${key}"`);
      return null;
    }
    try {
      const parsed = JSON.parse(str);
      console.log(`[SecureStore] ✅ Leída key="${key}" (JSON)`, parsed);
      return parsed;
    } catch {
      console.log(`[SecureStore] ✅ Leída key="${key}" (string)`, str);
      return str;
    }
  } catch (error) {
    console.error(`[SecureStore] ❌ Error leyendo key="${key}":`, error);
    return null;
  }
}

export async function deleteSecureData(key: string): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(key, { keychainService: "foodbank_credentials" });
    console.log(`[SecureStore] 🗑️ Eliminada key="${key}"`);
    return true;
  } catch (error) {
    console.error(`[SecureStore] ❌ Error eliminando key="${key}":`, error);
    return false;
  }
}
