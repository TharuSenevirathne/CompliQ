import { View, Text, TextInput, Pressable, TouchableOpacity, Keyboard, Alert } from "react-native"
import React from "react"
import { useRouter } from "expo-router"
import { useState } from "react"
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
    <Pressable onPress={Keyboard.dismiss} accessible={false} className="flex-1">
      <View className="flex-1 bg-white">
        {/* Decorative background circles */}
        <View className="absolute top-[-100] right-[-100] w-80 h-80 rounded-full bg-blue-50 opacity-50" />
        <View className="absolute bottom-[-80] left-[-80] w-72 h-72 rounded-full bg-blue-100 opacity-40" />

        {/* Main content */}
        <View className="flex-1 justify-center items-center px-8">
          {/* Header with Logo */}
          <View className="items-center mb-10">
            {/* Icon/Badge */}
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
              />
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">
                Password
              </Text>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                className="border-2 border-gray-200 bg-gray-50 p-4 rounded-xl text-gray-900"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Login Button */}
            <Pressable
              className="bg-blue-600 px-6 py-4 rounded-xl mb-4 shadow-md active:bg-blue-700"
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-white text-lg text-center font-bold">
                {isLoading ? "Logging in..." : "Login"}
              </Text>
            </Pressable>

            {/* Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-gray-400 text-sm">or</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center">
              <Text className="text-gray-600 text-base">Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => {
                  router.push("/register")
                }}
              >
                <Text className="font-bold text-red-600 text-base">
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <br /><br></br><br></br>

        {/* Footer */}
        <View className="absolute bottom-8 self-center items-center">
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