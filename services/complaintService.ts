import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/services/firebase"
import * as ImageManipulator from 'expo-image-manipulator'
import { FirebaseError } from 'firebase/app';

// Compress image before saving
const compressImage = async (uri: string): Promise<string> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }], 
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    )
    return manipResult.uri
  } catch (error) {
    console.error("Error compressing image:", error)
    return uri // Return original if compression fails
  }
}

// Convert image to base64
const convertToBase64 = async (uri: string): Promise<string | null> => {
  try {
    const response = await fetch(uri)
    const blob = await response.blob()
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error("Error converting to base64:", error)
    return null
  }
}

// Submit complaint to Firestore
export const submitComplaint = async (uid: string, data: any) => {
  try {
    console.log("submitComplaint → UID:", uid);
    console.log("Data:", JSON.stringify(data, null, 2));

    const docRef = await addDoc(collection(db, "complaints"), {
      ...data,
      userId: uid,
      status: data.status || "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("Success → Doc ID:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("submitComplaint ERROR:", {
      code: error.code,
      message: error.message,
      details: error.details || "No details",
    });

    return { success: false, error: error.message || "Unknown Firestore error" };
  }
};
