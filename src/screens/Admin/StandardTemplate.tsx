import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ImageBackground, Alert, Touchable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseconfig";
import { Pressable } from "react-native";

// Categorías de productos
const PRODUCT_CATEGORIES = [
  { id: "canasta_basica", name: "Canasta básica", color: "#FFE8CC" },
  { id: "fruta_verdura", name: "Fruta y verdura", color: "#FFE8CC" },
  { id: "carne_lacteos", name: "Carne, embutido, lácteos", color: "#FFEBEE" },
  { id: "abarrotes", name: "Abarrotes", color: "#FFF9C4" },
  { id: "no_alimenticios", name: "No alimenticios", color: "#E3F2FD" }
];

interface Product {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

export default function StandardTemplateScreen({ navigation }: any) {
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Nuevo producto
  const [newProduct, setNewProduct] = useState({
    name: "",
    quantity: 1,
    unit: "kg",
    category: "canasta_basica"
  });

  useEffect(() => {
    loadStandardTemplate();
  }, []);

  const loadStandardTemplate = async () => {
    try {
      setLoading(true);
      const templateDoc = await getDoc(doc(db, "deliveries", "standardTemplate"));
      
      if (templateDoc.exists()) {
        setProducts(templateDoc.data().products || {});
      }
    } catch (error) {
      console.error("Error cargando plantilla:", error);
      Alert.alert("Error", "No se pudo cargar la plantilla estándar");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      await setDoc(doc(db, "deliveries", "standardTemplate"), {
        products,
        lastUpdated: new Date()
      });

      Alert.alert("Éxito", "Despensa actualizada correctamente");
      setHasChanges(false);
    } catch (error) {
      console.error("Error guardando la despensa:", error);
      Alert.alert("Error", "No se pudo guardar la despensa");
    }
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    
    setProducts(prev => ({
      ...prev,
      [productId]: { ...prev[productId], quantity: newQuantity }
    }));
    setHasChanges(true);
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      "Eliminar producto",
      `¿Estás seguro de eliminar "${products[productId].name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            const updated = { ...products };
            delete updated[productId];
            setProducts(updated);
            setHasChanges(true);
          }
        }
      ]
    );
  };

  const handleAddProduct = () => {
    if (!newProduct.name.trim()) {
      Alert.alert("Error", "Ingresa el nombre del producto");
      return;
    }

    const productId = newProduct.name.toLowerCase().replace(/\s+/g, '_');
    
    setProducts(prev => ({
      ...prev,
      [productId]: {
        name: newProduct.name.trim(),
        quantity: newProduct.quantity,
        unit: newProduct.unit,
        category: newProduct.category
      }
    }));

    setHasChanges(true);
    setShowAddProduct(false);
    setNewProduct({
      name: "",
      quantity: 1,
      unit: "kg",
      category: "canasta_basica"
    });
  };

  // Agrupar productos por categoría
  const groupedProducts = Object.entries(products).reduce((acc, [id, product]) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push({ id, ...product });
    return acc;
  }, {} as Record<string, (Product & { id: string })[]>);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando plantilla...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground 
        source={require('../../../assets/background.jpg')}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestión de despensas</Text>
          <View style={{ width: 24 }} />
        </View>
      </ImageBackground>

      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color="#2196F3" />
        <Text style={styles.infoText}>
          Esta es la despensa que se asignará por defecto a todas las entregas programadas
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {PRODUCT_CATEGORIES.map((category) => {
          const categoryProducts = groupedProducts[category.id] || [];
          
          return (
            <View key={category.id} style={styles.categorySection}>
              <View style={[styles.categoryHeader, { backgroundColor: category.color }]}>
                <Text style={styles.categoryTitle}>{category.name}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {categoryProducts.length}
                  </Text>
                </View>
              </View>

              {categoryProducts.length === 0 ? (
                <View style={styles.emptyCategory}>
                  <Text style={styles.emptyCategoryText}>
                    No hay productos en esta categoría
                  </Text>
                </View>
              ) : (
                <View style={styles.productsList}>
                  {categoryProducts.map((product) => (
                    <View key={product.id} style={styles.productItem}>
                      <View style={styles.productInfo}>
                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                        <Text style={styles.productName}>{product.name}</Text>
                      </View>

                      <View style={styles.productControls}>
                        <View style={styles.quantityControl}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            activeOpacity={0.5}
                            onPress={() => handleUpdateQuantity(product.id, product.quantity - 0.5)}
                          >
                            <Ionicons name="remove" size={20} color="#718096" />
                          </TouchableOpacity>
                          
                          <Text style={styles.quantityText}>
                            {product.quantity} {product.unit}
                          </Text>
                          
                          <TouchableOpacity
                            style={styles.quantityButton}
                            activeOpacity={0.5}
                            onPress={() => handleUpdateQuantity(product.id, product.quantity + 0.5)}
                          >
                            <Ionicons name="add" size={20} color="#718096" />
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteProduct(product.id)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#E53E3E" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Añadir producto */}
        {showAddProduct ? (
          <View style={styles.addProductForm}>
            <Text style={styles.addProductTitle}>Nuevo producto</Text>
            
            <Text style={styles.label}>Nombre del producto</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Arroz"
              value={newProduct.name}
              onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
            />

            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Cantidad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  keyboardType="numeric"
                  value={String(newProduct.quantity === 0? "": String(newProduct.quantity))}
                  onChangeText={(text) => {
                    const num = text === ""? 0: parseFloat(text);
                    setNewProduct({ ...newProduct, quantity: isNaN(num) ? 0: num })}}
                />
              </View>
              
              <View style={styles.column}>
                <Text style={styles.label}>Unidad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="kg"
                  value={newProduct.unit}
                  onChangeText={(text) => setNewProduct({ ...newProduct, unit: text })}
                />
              </View>
            </View>

            <Text style={styles.label}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {PRODUCT_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    newProduct.category === cat.id && styles.categoryChipSelected,
                    { backgroundColor: newProduct.category === cat.id ? cat.color : "#F7FAFC" }
                  ]}
                  onPress={() => setNewProduct({ ...newProduct, category: cat.id })}
                >
                  <Text style={[
                    styles.categoryChipText,
                    newProduct.category === cat.id && styles.categoryChipTextSelected
                  ]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.addProductButtons}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setShowAddProduct(false)}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleAddProduct}
              >
                <Text style={styles.buttonText}>Agregar</Text>
              </TouchableOpacity>
              </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addProductButton}
            onPress={() => setShowAddProduct(true)}
          >
            <Ionicons name="add-circle" size={24} color="#4CAF50" />
            <Text style={styles.addProductButtonText}>Añadir producto</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Botón guardar cambios (flotante) */}
      {hasChanges && (
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveTemplate}
          >
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  headerBackground: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E53E3E",
  },
  loadingText: {
    fontSize: 18,
    color: "#4A5568",
    textAlign: "center",
    marginTop: 50,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#2196F3",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categorySection: {
    marginTop: 20,
    marginBottom: 10,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
  },
  categoryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2D3748",
  },
  emptyCategory: {
    padding: 20,
    alignItems: "center",
  },
  emptyCategoryText: {
    fontSize: 14,
    color: "#A0AEC0",
  },
  productsList: {
    paddingTop: 10,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  productName: {
    fontSize: 16,
    color: "#2D3748",
    marginLeft: 10,
    flex: 1,
  },
  productControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 5,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3748",
    minWidth: 60,
    textAlign: "center",
  },
  deleteButton: {
    padding: 8,
  },
  addProductButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 100,
    gap: 10,
  },
  addProductButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  addProductForm: {
    backgroundColor: "#F7FAFC",
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
    marginBottom: 100,
  },
  addProductTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#2D3748",
    backgroundColor: "#ffffff",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  column: {
    flex: 1,
  },
  categoriesScroll: {
    marginVertical: 10,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  categoryChipSelected: {
    borderColor: "#4CAF50",
    borderWidth: 2,
    backgroundColor: "#E8F5E9",
  },
  categoryChipText: {
    fontSize: 14,
    color: "#4A5568",
  },
  categoryChipTextSelected: {
    fontWeight: "600",
    color: "#2D3748",
  },
  addProductButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#4CAF50",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  secondaryButtonText: {
    color: "#4A5568",
  },
  saveButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53E3E",
    padding: 18,
    borderRadius: 15,
    gap: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
});