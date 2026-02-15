import { createUserWithEmailAndPassword,updateProfile,signInWithEmailAndPassword,signOut} from "firebase/auth"
import { auth, db } from "./firebase"
import { doc, setDoc } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Login user
export const login = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password)
}

// Register user
export const registerUser = async (
  fullname: string,
  email: string,
  password: string
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )

  await updateProfile(userCredential.user, { displayName: fullname })

  // Create user doc in Firestore
  await setDoc(doc(db, "users", userCredential.user.uid), {
    name: fullname,
    role: "user",
    email,
    createAt: new Date()
  })
  return userCredential.user
}

// Logout user
export const logoutUser = async () => {
  await signOut(auth)
  AsyncStorage.clear()
  return
}
