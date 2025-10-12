import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../screens/firebaseconfig";

/**
 * Revisa si el usuario aceptó la política de privacidad
 */
export const hasAcceptedPrivacyPolicy = async (uid: string): Promise<boolean> => {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (!userDoc.exists()) return false;
  const data = userDoc.data();
  return data.acceptedPrivacyPolicy === true;
};

/**
 * Marca la política de privacidad como aceptada para un usuario
 */
export const acceptPrivacyPolicy = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { acceptedPrivacyPolicy: true });
};
