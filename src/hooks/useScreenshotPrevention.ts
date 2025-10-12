import { useEffect } from "react"
import * as ScreenCapture from "expo-screen-capture"
import { Platform } from "react-native"

export function useScreenshotPrevention() {
  useEffect(() => {
    let subscription: any

    const preventScreenshots = async () => {
      if (Platform.OS === "android" || Platform.OS === "ios") {
        try {
          // Prevent screenshots and screen recording
          await ScreenCapture.preventScreenCaptureAsync()

          // Listen for screenshot attempts (iOS only)
          subscription = ScreenCapture.addScreenshotListener(() => {
            console.warn("[Security] Screenshot attempt detected")
            // You can show an alert or log this event
          })
        } catch (error) {
          console.error("[Security] Failed to prevent screenshots:", error)
        }
      }
    }

    preventScreenshots()

    return () => {
      // Re-allow screenshots when component unmounts
      ScreenCapture.allowScreenCaptureAsync()
      if (subscription) {
        subscription.remove()
      }
    }
  }, [])
}
