import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/services/firebase"
import * as ImageManipulator from 'expo-image-manipulator'

// Compress image before saving
const compressImage = async (uri: string): Promise<string> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }], // Resize to max 800px width
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
export const submitComplaint = async (
  userId: string,
  complaintData: {
    title: string
    description: string
    type: string
    location: string
    priority: string
    date: Date
    images: string[]
    video: string | null
  }
) => {
  try {
    // Limit to maximum 3 images to avoid Firestore size limit
    const imagesToProcess = complaintData.images.slice(0, 3)
    
    // Compress and convert images to base64
    const imageBase64Array: string[] = []
    for (const imageUri of imagesToProcess) {
      // First compress the image
      const compressedUri = await compressImage(imageUri)
      // Then convert to base64
      const base64 = await convertToBase64(compressedUri)
      if (base64) {
        imageBase64Array.push(base64)
      }
    }

    // Create document in Firestore
    const docRef = await addDoc(collection(db, "complaints"), {
      userId,
      title: complaintData.title,
      description: complaintData.description,
      type: complaintData.type,
      location: complaintData.location,
      priority: complaintData.priority,
      incidentDate: complaintData.date.toISOString(),
      status: "pending",
      createdAt: serverTimestamp(),
      images: imageBase64Array,
      imageCount: imageBase64Array.length
    })

    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error submitting complaint:", error)
    return { success: false, error }
  }
}