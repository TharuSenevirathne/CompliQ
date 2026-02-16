import { createUserWithEmailAndPassword,updateProfile,signInWithEmailAndPassword,signOut} from "firebase/auth"
import { auth, db } from "./firebase"
import { doc, setDoc } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { GoogleAuthProvider,signInWithCredential,} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { Alert } from "react-native";

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


// export const signInWithGoogle = async () => {
//   try {
//     // Redirect URI හදන්න (useProxy ඕන නෑ)
//     const redirect = makeRedirectUri();

//     const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
//       clientId: '994176820391-blkivvrrqufrgdoar1okvsqlnprjetek.apps.googleusercontent.com',
//       redirectUri: redirect,
//     });

//     if (!request) {
//       throw new Error("Couldn't create Google auth request");
//     }

//     const authResponse = await promptAsync();

//     if (authResponse.type === 'success') {
//       const idToken = authResponse.params.id_token;
//       const credential = GoogleAuthProvider.credential(idToken);
//       const userCredential = await signInWithCredential(auth, credential);
      
//       console.log('Google login success:', userCredential.user.email);
//       return userCredential.user;
//     } else {
//       console.log('Google auth dismissed or failed:', authResponse.type);
//       throw new Error('Google login was cancelled or failed');
//     }
//   } catch (error: any) {
//     console.error('Google sign-in error:', error);
//     Alert.alert('Google Login Failed', error.message || 'Please try again');
//     throw error;
//   }
// };