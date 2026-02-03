import { View,Text,TextInput,Pressable,TouchableOpacity,TouchableWithoutFeedback,Keyboard,Alert } from "react-native"
import React from "react"
import { useRouter } from "expo-router"
import  { useState } from "react"
import { useLoader } from "@/hooks/useLoader"
import { login } from "@/services/authService"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/services/firebase"

// Login Screen Component
const Login = () => {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { showLoader, hideLoader, isLoading } = useLoader()

  // Handle Login Button Press
const handleLogin = async () => {
  if (!email || !password || isLoading) {
    Alert.alert("Please enter email and password..!!");
    return;
  }

  showLoader();
  try {
    const userCredential = await login(email, password);
    const currentUser = userCredential.user;

    console.log("Login success - UID:", currentUser.uid);
    console.log("Login success - Email:", currentUser.email);

    // check user role from Firestore
    const userDocRef = doc(db, "users", currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const role = userData?.role;

      console.log("Role from Firestore:", role);

      if (role === "admin") {
        console.log("Redirecting ADMIN");
        router.replace("/(adminDashboard)/adminHome");
      } else {
        console.log("Redirecting USER");
        router.replace("/(dashboard)/userHome");
      }
    } else {
      console.log("No user document found → fallback to user home");
      router.replace("/(dashboard)/userHome");
    }
  } catch (error) {
    let message = "Login failed. Please try again.";
    if (error instanceof Error) {
      message = error.message;
    }
    console.error("Login error:", error);
    Alert.alert("Login failed", message);
  } finally {
    hideLoader();
  }
};

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 justify-center items-center bg-black p-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-5xl font-bold text-white text-center mb-2">
            WELCOME
          </Text>
          <Text className="text-gray-400 text-center text-base">
            Login to continue 🧸
          </Text>
        </View>

        {/* Login Card */}
        <View className="w-full bg-white rounded-3xl p-8 shadow-2xl">
          <Text className="text-3xl font-bold mb-6 text-center text-black">
            LOGIN
          </Text>

          {/* Email Input */}
          <TextInput
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            className="border-2 border-gray-200 bg-gray-50 p-4 mb-4 rounded-xl text-black"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password Input */}
          <TextInput
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            className="border-2 border-gray-200 bg-gray-50 p-4 mb-6 rounded-xl text-black"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Login Button */}
          <Pressable
            className="px-6 py-4 rounded-xl mb-4"
            style={{ backgroundColor: "#0356fc" }}
            onPress={handleLogin}
          >
            <Text className="text-white text-lg text-center font-semibold">
              Login
            </Text>
          </Pressable>

          {/* Register Link */}
          <View className="flex-row justify-center mt-2">
            <Text className="text-gray-600">Don't have an account ? </Text>
            <TouchableOpacity
              onPress={() => {
                router.push("/register")
              }}
            >
              <Text className="font-bold" style={{ color: "#fa2323" }}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="mt-8">
          <Text className="text-gray-500 text-sm text-center">
            Powered by Tharu senevirathne
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default Login