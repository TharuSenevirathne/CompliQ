import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/services/firebase"

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
    // Convert images to base64
    const imageBase64Array: string[] = []
    for (const imageUri of complaintData.images) {
      const base64 = await convertToBase64(imageUri)
      if (base64) {
        imageBase64Array.push(base64)
      }
    }

    // Convert video to base64 if exists
    let videoBase64 = null
    if (complaintData.video) {
      videoBase64 = await convertToBase64(complaintData.video)
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
      video: videoBase64
    })

    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error submitting complaint:", error)
    return { success: false, error }
  }
}