import { View, Text, TextInput, Pressable, TouchableOpacity, Keyboard, Alert, ActivityIndicator } from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { login } from "@/services/authService"
// import { signInWithGoogle } from "@/services/authService"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/services/firebase"
import { MaterialIcons } from "@expo/vector-icons"
import { FontAwesome } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from "@/services/firebase";

const Login = () => {

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
      clientId: '994176820391-blkivvrrqufrgdoar1okvsqlnprjetek.apps.googleusercontent.com',
    });

  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Handle Email/Password Login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      const userCredential = await login(email, password);
      const currentUser = userCredential.user;

      console.log("✅ Login success - UID:", currentUser.uid);
      console.log("✅ Login success - Email:", currentUser.email);

      // Check user role from Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData?.role;

        console.log("🔵 Role from Firestore:", role);

        if (role === "admin") {
          console.log("🔵 Redirecting to ADMIN dashboard");
          router.replace("/(adminDashboard)/adminHome");
        } else {
          console.log("🔵 Redirecting to USER dashboard");
          router.replace("/(dashboard)/userHome");
        }
      } else {
        console.log("⚠️ No user document found → defaulting to user home");
        router.replace("/(dashboard)/userHome");
      }
    } catch (error: any) {
      console.error("❌ Login error:", error);
      let message = "Login failed. Please check your credentials.";
      
      if (error.code === 'auth/invalid-email') {
        message = "Invalid email address";
      } else if (error.code === 'auth/user-not-found') {
        message = "No account found with this email";
      } else if (error.code === 'auth/wrong-password') {
        message = "Incorrect password";
      } else if (error.code === 'auth/invalid-credential') {
        message = "Invalid email or password";
      } else if (error.message) {
        message = error.message;
      }
      
      Alert.alert("Login Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Login
  // const handleGoogleLogin = async () => {
  //   if (isLoading) return;
  //   if (!request) {
  //     Alert.alert("Error", "Google login not ready yet. Try again.");
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     const authResponse = await promptAsync();

  //     if (authResponse.type === 'success') {
  //       const idToken = authResponse.params.id_token;
  //       const credential = GoogleAuthProvider.credential(idToken);
  //       const userCredential = await signInWithCredential(auth, credential);

  //       console.log("Google login success:", userCredential.user.email);

  //       // Role check කරලා redirect කරන්න
  //       const userDocRef = doc(db, "users", userCredential.user.uid);
  //       const userDoc = await getDoc(userDocRef);

  //       if (userDoc.exists()) {
  //         const role = userDoc.data()?.role;
  //         if (role === "admin") {
  //           router.replace("/(adminDashboard)/adminHome");
  //         } else {
  //           router.replace("/(dashboard)/userHome");
  //         }
  //       } else {
  //         router.replace("/(dashboard)/userHome");
  //       }
  //     } else {
  //       console.log("Google login dismissed:", authResponse.type);
  //     }
  //   } catch (error: any) {
  //     console.error("Google login error:", error);
  //     Alert.alert("Google Login Failed", error.message || "Please try again");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <Pressable onPress={Keyboard.dismiss} accessible={false} className="flex-1">
      <View className="flex-1 bg-white">
        {/* Decorative background circles */}
        <View className="absolute top-[-100] right-[-100] w-80 h-80 rounded-full bg-blue-50 opacity-50" />
        <View className="absolute bottom-[-80] left-[-80] w-72 h-72 rounded-full bg-blue-100 opacity-40" />

        {/* Main content */}
        <View className="flex-1 justify-center items-center px-8">
          {/* Header with Logo */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-3xl bg-blue-600 justify-center items-center mb-5 shadow-lg">
              <Text className="text-white text-4xl font-bold">C</Text>
            </View>

            <Text className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Welcome Back
            </Text>
            <Text className="text-blue-600 text-base font-medium">
              Login to continue
            </Text>
          </View>

          {/* Login Card */}
          <View className="w-full bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">
                Email
              </Text>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                className="border-2 border-gray-200 bg-gray-50 p-4 rounded-xl text-gray-900"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  className="border-2 border-gray-200 bg-gray-50 p-4 rounded-xl text-gray-900 pr-12"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                  disabled={isLoading}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={24}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className={`bg-blue-600 px-6 py-4 rounded-xl mb-4 shadow-md ${
                isLoading ? 'opacity-70' : 'active:bg-blue-700'
              }`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white text-lg font-bold ml-2">Logging in...</Text>
                </View>
              ) : (
                <Text className="text-white text-lg text-center font-bold">Login</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-gray-400 text-sm">or</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Google Login Button */}
            {/* <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={isLoading}
              className={`bg-white border-2 border-gray-200 py-4 rounded-xl flex-row justify-center items-center mb-4 ${
                isLoading ? 'opacity-70' : ''
              }`}
            >
              <FontAwesome name="google" size={24} color="#DB4437" />
              <Text className="ml-3 font-semibold text-base text-gray-700">
                Continue with Google
              </Text>
            </TouchableOpacity> */}

            {/* Register Link */}
            <View className="flex-row justify-center mt-2">
              <Text className="text-gray-600 text-base">Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push("/register")}
                disabled={isLoading}
              >
                <Text className="font-bold text-blue-600 text-base">Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="pb-8 items-center">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-blue-600 mr-2" />
            <Text className="text-gray-400 text-xs font-medium tracking-wide">
              Powered by Tharu Senevirathne
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

export default Login