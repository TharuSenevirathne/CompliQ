import { createUserWithEmailAndPassword,updateProfile,signInWithEmailAndPassword,signOut} from "firebase/auth"
import { auth, db } from "./firebase"
import { doc, setDoc } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { GoogleAuthProvider,signInWithCredential,} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

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


export const signInWithGoogle = async () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'YOUR_GOOGLE_WEB_CLIENT_ID',   // Firebase Console එකෙන් ගන්න
  });

  if (request) {
    const result = await promptAsync();
    if (result?.type === 'success') {
      const credential = GoogleAuthProvider.credential(result.params.id_token);
      return await signInWithCredential(auth, credential);
    }
  }
};