// secureNetwork.ts
import { Alert } from "react-native";

/**
 * Verifica si el endpoint usa HTTPS
 */
export function isSecureEndpoint(url: string): boolean {
  return url.startsWith("https://");
}

/**
 * Wrapper seguro para fetch con validación HTTPS
 */
export async function secureFetch(
  url: string,
  options: RequestInit = {},
  logFn?: (msg: string) => void
) {
  if (!isSecureEndpoint(url)) {
    const message = `[Seguridad] ❌ Conexión insegura bloqueada: ${url}`;
    console.error(message);
    logFn?.(message);
    Alert.alert(
      "Conexión bloqueada",
      "Se detectó una conexión no segura (HTTP). Por seguridad, se canceló la operación."
    );
    throw new Error("Conexión insegura bloqueada");
  }

  const message = `[Seguridad] ✅ Conexión segura verificada: ${url}`;
  console.log(message);
  logFn?.(message);

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorMsg = `[Seguridad] ⚠️ Error en la respuesta HTTPS: ${response.status}`;
    console.warn(errorMsg);
    logFn?.(errorMsg);
  }

  return response;
}
