import React from "react";
import {useEffect, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {auth, db} from './firebaseconfig';
import {doc, getDoc, updateDoc} from 'firebase/firestore';

export default function ProfileScreen(){
    const [userData, setUserData] = useState({
        fullName: "",
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
                        setUserData({
                            fullName: data?.fullName ?? "",
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
                await updateDoc(userRef, {
                   fullName: userData.fullName,
                   phone: userData.phone,
                   email: userData.email 
                })
                alert("Perfil actualizado correctamente");
            }
        }catch(error){
            console.log("Error al actualizar perfil: ", error);
        }
    }
    if(loading){
        return(
            <View>
                <Text>Cargando perfil...</Text>
            </View>
        )
    }

    return(
        <View>
            <Image
        source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
        style={styles.avatar}
      />

      {/* Campos de perfil */}
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={userData.fullName}
        onChangeText={(text) => setUserData({ ...userData, fullName: text })}
      />

      <TextInput
        style={[styles.input, { backgroundColor: "#eee" }]}
        placeholder="Correo"
        value={userData.email}
        editable={false} // No editable porque viene del auth
      />

      <TextInput
        style={styles.input}
        placeholder="Número"
        value={userData.phone}
        onChangeText={(text) => setUserData({ ...userData, phone: text })}
      />

      {/* Botón para guardar cambios */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>

    </View>
    )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    marginTop: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#e57373",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
