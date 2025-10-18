"use client"

import { useEffect } from "react"
import * as ScreenCapture from "expo-screen-capture"
import { Platform, Alert } from "react-native";

/**
 * Hook to secure sensitive screens from screenshots and screen recording
 * Implements MSTG-PLATFORM-2
 */
export function useSecureScreen(options?: {
  showAlert?: boolean
  alertMessage?: string
}) {
  useEffect(() => {
    let subscription: any

    const activateSecureMode = async () => {
      if (Platform.OS === "android" || Platform.OS === "ios") {
        try {
          // Prevent screenshots and screen recording
          await ScreenCapture.preventScreenCaptureAsync()

          // Listen for screenshot attempts (iOS only)
          subscription = ScreenCapture.addScreenshotListener(() => {
            console.warn("[Security] Screenshot attempt detected")

            if (options?.showAlert) {
              Alert.alert(
                "Seguridad",
                options.alertMessage || "Las capturas de pantalla están deshabilitadas por seguridad.",
                [{ text: "Entendido" }],
              )
            }
          })

          console.log("[Security] Secure screen mode activated")
        } catch (error) {
          console.error("[Security] Failed to activate secure mode:", error)
        }
      }
    }

    activateSecureMode()

    return () => {
      // Re-allow screenshots when leaving secure screen
      ScreenCapture.allowScreenCaptureAsync()
        .then(() => console.log("[Security] Secure screen mode deactivated"))
        .catch((err) => console.error("[Security] Failed to deactivate secure mode:", err))

      if (subscription) {
        subscription.remove()
      }
    }
  }, [options?.showAlert, options?.alertMessage])
}
