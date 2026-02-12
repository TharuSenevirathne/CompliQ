// services/complaintService.ts
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/services/firebase"
import { updateDoc } from "firebase/firestore";
import { doc } from "firebase/firestore";


// Upload single image to Firebase Storage
const uploadImage = async (uri: string, complaintId: string, index: number) => {
  try {
    const response = await fetch(uri)
    const blob = await response.blob()
    
    const storageRef = ref(storage, `complaints/${complaintId}/image_${index}.jpg`)
    await uploadBytes(storageRef, blob)
    
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error) {
    console.error("Error uploading image:", error)
    return null
  }
}

// Upload video to Firebase Storage
const uploadVideo = async (uri: string, complaintId: string) => {
  try {
    const response = await fetch(uri)
    const blob = await response.blob()
    
    const storageRef = ref(storage, `complaints/${complaintId}/video.mp4`)
    await uploadBytes(storageRef, blob)
    
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error) {
    console.error("Error uploading video:", error)
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
    // First create the document to get an ID
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
      imageUrls: [],
      videoUrl: null
    })

    const complaintId = docRef.id

    // Upload images if any
    const imageUrls: string[] = []
    if (complaintData.images.length > 0) {
      for (let i = 0; i < complaintData.images.length; i++) {
        const url = await uploadImage(complaintData.images[i], complaintId, i)
        if (url) imageUrls.push(url)
      }
    }

    // Upload video if any
    let videoUrl = null
    if (complaintData.video) {
      videoUrl = await uploadVideo(complaintData.video, complaintId)
    }

    // Update document with media URLs
    await updateDoc(doc(db, "complaints", complaintId), {
      imageUrls,
      videoUrl
    })

    return { success: true, id: complaintId }
  } catch (error) {
    console.error("Error submitting complaint:", error)
    return { success: false, error }
  }
}