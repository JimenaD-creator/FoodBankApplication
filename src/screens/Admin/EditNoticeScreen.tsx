"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "../firebaseconfig"
import { useNavigation } from "@react-navigation/native"
import type { NavigationProp } from "../../../App"

export default function EditNoticeScreen() {
  const navigation = useNavigation<NavigationProp>()
  const [noticeContent, setNoticeContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadNoticeContent()
  }, [])

  const loadNoticeContent = async () => {
    try {
      const noticeDoc = await getDoc(doc(db, "settings", "landingNotice"))
      if (noticeDoc.exists()) {
        setNoticeContent(noticeDoc.data().content)
      } else {
        setNoticeContent(
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        )
      }
    } catch (error) {
      console.error("Error loading notice content:", error)
      Alert.alert("Error", "No se pudo cargar el contenido del aviso")
    } finally {
      setLoading(false)
    }
  }

  const saveNoticeContent = async () => {
    if (!noticeContent.trim()) {
      Alert.alert("Error", "El contenido del aviso no puede estar vacío")
      return
    }

    setSaving(true)
    try {
      await setDoc(doc(db, "settings", "landingNotice"), {
        content: noticeContent,
        updatedAt: new Date().toISOString(),
      })
      Alert.alert("Éxito", "El aviso se ha actualizado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ])
    } catch (error) {
      console.error("Error saving notice content:", error)
      Alert.alert("Error", "No se pudo guardar el contenido del aviso")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53E3E" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Aviso Landing</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#2196F3" />
          <Text style={styles.infoText}>
            Este contenido se mostrará en la sección de avisos de la página principal (Landing2)
          </Text>
        </View>

        <Text style={styles.label}>Contenido del Aviso</Text>
        <TextInput
          style={styles.textArea}
          value={noticeContent}
          onChangeText={setNoticeContent}
          placeholder="Escribe el contenido del aviso aquí..."
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />

        <Text style={styles.characterCount}>{noticeContent.length} caracteres</Text>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={saveNoticeContent}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={saving}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1976D2",
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#2D3748",
    minHeight: 200,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  characterCount: {
    fontSize: 12,
    color: "#718096",
    marginTop: 8,
    textAlign: "right",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#E53E3E",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  cancelButtonText: {
    color: "#718096",
    fontSize: 16,
    fontWeight: "600",
  },
})
