import { View, Text, TextInput, Pressable, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Alert, ScrollView } from "react-native"
import React from "react"
import { useRouter } from "expo-router"
import { registerUser } from "@/services/authService"
import { useLoader } from "@/hooks/useLoader"
import { useState } from "react"

// Register Screen
const Register = () => {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [conPassword, setConPassword] = useState("")
  const { showLoader, hideLoader, isLoading } = useLoader()

  // Handle Register Button Press
  const handleRegister = async () => {
    if (!name || !email || !password || !conPassword || isLoading) {
      Alert.alert("Please fill all fields...!")
      return
    }
    if (password !== conPassword) {
      Alert.alert("Password doesn't match...!")
      return
    }
    showLoader()
    try {
      await registerUser(name, email, password)
      Alert.alert("Account created..!")
      router.replace("/login")
    } catch (e) {
      console.error(e)
      Alert.alert("Registration failed..!")
    } finally {
      hideLoader()
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 bg-white">
        {/* Decorative background circles */}
        <View className="absolute top-[-100] right-[-100] w-80 h-80 rounded-full bg-blue-50 opacity-50" />
        <View className="absolute bottom-[-80] left-[-80] w-72 h-72 rounded-full bg-blue-100 opacity-40" />

        {/* ScrollView for better responsiveness */}
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center items-center px-6 py-8">
            {/* Header with Logo */}
            <View className="items-center mb-6">
              {/* Icon/Badge */}
              <View className="w-20 h-20 rounded-3xl bg-blue-600 justify-center items-center mb-4 shadow-lg">
                <Text className="text-white text-4xl font-bold">C</Text>
              </View>

              <Text className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">
                Join Us
              </Text>
              <Text className="text-blue-600 text-sm font-medium">
                Create your account
              </Text>
            </View>

            {/* Register Card */}
            <View className="w-full bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              {/* Name Input */}
              <View className="mb-3">
                <Text className="text-gray-700 text-xs font-semibold mb-1.5 ml-1">
                  Full Name
                </Text>
                <TextInput
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                  className="border-2 border-gray-200 bg-gray-50 p-3.5 rounded-xl text-gray-900"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Email Input */}
              <View className="mb-3">
                <Text className="text-gray-700 text-xs font-semibold mb-1.5 ml-1">
                  Email
                </Text>
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  className="border-2 border-gray-200 bg-gray-50 p-3.5 rounded-xl text-gray-900"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Password Input */}
              <View className="mb-3">
                <Text className="text-gray-700 text-xs font-semibold mb-1.5 ml-1">
                  Password
                </Text>
                <TextInput
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  className="border-2 border-gray-200 bg-gray-50 p-3.5 rounded-xl text-gray-900"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* Confirm Password Input */}
              <View className="mb-5">
                <Text className="text-gray-700 text-xs font-semibold mb-1.5 ml-1">
                  Confirm Password
                </Text>
                <TextInput
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  className="border-2 border-gray-200 bg-gray-50 p-3.5 rounded-xl text-gray-900"
                  secureTextEntry
                  value={conPassword}
                  onChangeText={setConPassword}
                />
              </View>

              {/* Register Button */}
              <Pressable
                className="bg-blue-600 px-6 py-3.5 rounded-xl mb-3 shadow-md active:bg-blue-700"
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text className="text-white text-base text-center font-bold">
                  {isLoading ? "Creating Account..." : "Register"}
                </Text>
              </Pressable>

              {/* Divider */}
              <View className="flex-row items-center my-3">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="mx-3 text-gray-400 text-xs">or</Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>

              {/* Login Link */}
              <View className="flex-row justify-center">
                <Text className="text-gray-600 text-sm">Already have an account? </Text>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/login")
                  }}
                >
                  <Text className="font-bold text-red-600 text-sm">
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer with extra bottom padding */}
            <View className="mt-6 mb-4 items-center">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-blue-600 mr-2" />
                <Text className="text-gray-400 text-xs font-medium tracking-wide">
                  Powered by Tharu Senevirathne
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default Register