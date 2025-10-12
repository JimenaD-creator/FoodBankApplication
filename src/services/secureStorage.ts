import * as SecureStore from "expo-secure-store"

// Guardar valor seguro
export async function saveSecureData(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value, {
      keychainService: "foodbank_credentials",
    })
    console.log(`🔐 ${key} guardado en SecureStore`)
  } catch (error) {
    console.error("Error guardando en SecureStore:", error)
  }
}

// Leer valor seguro
export async function getSecureData(key: string) {
  try {
    const value = await SecureStore.getItemAsync(key)
    return value
  } catch (error) {
    console.error("Error obteniendo valor de SecureStore:", error)
    return null
  }
}

// Eliminar dato seguro
export async function deleteSecureData(key: string) {
  try {
    await SecureStore.deleteItemAsync(key)
    console.log(`🧹 ${key} eliminado de SecureStore`)
  } catch (error) {
    console.error("Error eliminando valor de SecureStore:", error)
  }
}

export const storeData = saveSecureData
export const getData = getSecureData
