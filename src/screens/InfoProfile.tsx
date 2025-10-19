import React from "react";
import {useEffect, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ImageBackground, Alert} from 'react-native';
import {auth, db} from './firebaseconfig';
import {doc, getDoc, updateDoc} from 'firebase/firestore';
import { Ionicons } from "@expo/vector-icons";
import { deleteSecureData } from "../services/secureStorage";

export default function ProfileScreen({ navigation }: any){
    const [userData, setUserData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        phone: "",
    })
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try{
                const user = auth.currentUser;
                if(user){
                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);

                    if(userSnap.exists()){
                        const data = userSnap.data();
                        // Separar nombre y apellido si vienen en fullName
                        const fullName = data?.fullName || "";
                        const nameParts = fullName.split(' ');
                        const nombre = nameParts[0] || "";
                        const apellido = nameParts.slice(1).join(' ') || "";
                        
                        setUserData({
                            nombre: nombre,
                            apellido: apellido,
                            email: data?.email ?? "",
                            phone: data?.phone ?? ""
                        });
                    }
                }
            }catch (error){
                console.log("Error al obtener datos del usuario: ", error);
            }finally{
                setLoading(false);
            }
        }
        fetchUserData();
    }, []);

    const handleSave = async () => {
        try{
            const user = auth.currentUser;
            if(user){
                const userRef = doc(db, "users", user.uid);
                // Combinar nombre y apellido para guardar como fullName
                const fullName = `${userData.nombre} ${userData.apellido}`.trim();
                
                await updateDoc(userRef, {
                   fullName: fullName,
                   phone: userData.phone,
                   email: userData.email 
                })
                alert("Perfil actualizado correctamente");
            }
        }catch(error){
            console.log("Error al actualizar perfil: ", error);
        }
    }

    const handleLogout = async () => {
    Alert.alert(
        "Cerrar sesión",
        "¿Estás seguro de que deseas salir?",
        [
            {
                text: "Cancelar",
                style: "cancel"
            },
            {
                text: "Cerrar sesión",
                style: "destructive",
                onPress: async () => {
                    try {
                        await auth.signOut();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                        await deleteSecureData("user_uid");
                        await deleteSecureData("user_role");
                    } catch (error) {
                        console.log("Error al cerrar sesión: ", error);
                        Alert.alert("Error", "No se pudo cerrar sesión");
                    }
                }
            }
        ]
    );
}

    if(loading){
        return(
            <ImageBackground 
                source={require('../../assets/background.jpg')}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Cargando perfil...</Text>
                </View>
            </ImageBackground>
        )
    }

    return(
        <View style={styles.container}>
            {/* Header */}
            <ImageBackground 
                source={require('../../assets/background.jpg')}
                style={styles.headerBackground}
                resizeMode="cover"
            >
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#E53E3E" />
                    </TouchableOpacity>
                    <Image 
                        source={require('../../assets/logo_no_background.png')} 
                        style={styles.headerLogo}
                        resizeMode="contain"
                    />
                    <View style={styles.headerRight} />
                </View>
            </ImageBackground>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    {/* Avatar con badge de edición */}
                    <View style={styles.avatarContainer}>
                        <Image
                            source={require('../../assets/usuario.png')} 
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editAvatarBadge}>
                            <Ionicons name="camera" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Campos de información */}
                    <View style={styles.fieldsContainer}>
                        {/* Fila con Nombre y Apellido */}
                        <View style={styles.row}>
                            <View style={styles.column}>
                                <Text style={styles.label}>Nombre</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        value={userData.nombre}
                                        onChangeText={(text:string) => setUserData({ ...userData, nombre: text })}
                                        placeholder=" "
                                    />
                                </View>
                            </View>
                            <View style={styles.column}>
                                <Text style={styles.label}>Apellido</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        value={userData.apellido}
                                        onChangeText={(text:string) => setUserData({ ...userData, apellido: text })}
                                        placeholder=" "
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Correo */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Correo</Text>
                            <View style={styles.emailContainer}>
                                <Ionicons name="mail-outline" size={20} color="#718096" />
                                <Text style={styles.emailText}>{userData.email}</Text>
                            </View>
                        </View>

                        {/* Número con bandera */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Número</Text>
                            <View style={styles.phoneContainer}>
                                <View style={styles.phonePrefix}>
                                    <Text style={styles.flag}>🇲🇽</Text>
                                    <Text style={styles.prefixText}>+52</Text>
                                </View>
                                <TextInput
                                    style={styles.phoneInput}
                                    value={userData.phone}
                                    onChangeText={(text:string) => setUserData({ ...userData, phone: text })}
                                    keyboardType="phone-pad"
                                    placeholder=" "
                                />
                            </View>
                        </View>

                        {/* Botón Guardar cambios */}
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Guardar cambios</Text>
                        </TouchableOpacity>

                        {/* Cerrar sesión */}
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Text style={styles.logoutText}>Cerrar sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Footer con logo y redes sociales */}
            <View style={styles.footer}>
                <Image 
                    source={require('../../assets/splash_1.png')} 
                    style={styles.footerLogo}
                    resizeMode="contain"
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
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
        elevation: 8,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    backButton: {
        padding: 5,
    },
    headerLogo: {
        width: 120,
        height: 40,
    },
    headerRight: {
        width: 34, // Para balancear el botón de regreso
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    content: {
        padding: 20,
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: '#2D3748',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: 30,
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: "#E2E8F0",
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FF9800',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    fieldsContainer: {
        gap: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    column: {
        flex: 1,
    },
    fieldContainer: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#2D3748',
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 8,
        backgroundColor: "#ffffff",
    },
    input: {
        padding: 12,
        fontSize: 16,
        color: '#2D3748',
        minHeight: 45,
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: "#E2E8F0",
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#F7FAFC",
        minHeight: 45,
    },
    emailText: {
        fontSize: 16,
        color: '#4A5568',
        marginLeft: 10,
        flex: 1,
    },
    phoneContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        overflow: 'hidden',
    },
    phonePrefix: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRightWidth: 1,
        borderRightColor: '#E2E8F0',
    },
    flag: {
        fontSize: 16,
        marginRight: 5,
    },
    prefixText: {
        fontSize: 16,
        color: '#4A5568',
        fontWeight: '500',
    },
    phoneInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#2D3748',
    },
    saveButton: {
        backgroundColor: "#E53E3E",
        padding: 15,
        borderRadius: 25,
        alignItems: "center",
        marginTop: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    saveButtonText: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 16,
    },
    logoutButton: {
        padding: 15,
        alignItems: "center",
        marginTop: 10,
    },
    logoutText: {
        color: "#E53E3E",
        fontWeight: "bold",
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        backgroundColor: '#ffffff',
    },
    footerLogo: {
        width: 80,
        height: 25,
    },
    socialIcons: {
        flexDirection: 'row',
        gap: 15,
    },
    socialIcon: {
        padding: 5,
    },
});