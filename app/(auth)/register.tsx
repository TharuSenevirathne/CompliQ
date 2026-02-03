import { View,Text,TextInput,Pressable,TouchableOpacity,TouchableWithoutFeedback,Keyboard,Alert } from "react-native"
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
      <View className="flex-1 justify-center items-center bg-black p-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-5xl font-bold text-white text-center mb-2">
            JOIN US
          </Text>
          <Text className="text-gray-400 text-center text-base">
            Create your account 🙈
          </Text>
        </View>

        {/* Register Card */}
        <View className="w-full bg-white rounded-3xl p-8 shadow-2xl">
          <Text className="text-3xl font-bold mb-6 text-center text-black">
            REGISTER
          </Text>

          {/* Name Input */}
          <TextInput
            placeholder="Name"
            placeholderTextColor="#9CA3AF"
            className="border-2 border-gray-200 bg-gray-50 p-4 mb-4 rounded-xl text-black"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />

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
            className="border-2 border-gray-200 bg-gray-50 p-4 mb-4 rounded-xl text-black"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Confirm Password Input */}
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#9CA3AF"
            className="border-2 border-gray-200 bg-gray-50 p-4 mb-6 rounded-xl text-black"
            secureTextEntry
            value={conPassword}
            onChangeText={setConPassword}
          />

          {/* Register Button */}
          <Pressable
            className="px-6 py-4 rounded-xl mb-4"
            style={{ backgroundColor: "#0356fc" }}
            onPress={handleRegister}
          >
            <Text className="text-white text-lg text-center font-semibold">
              Register
            </Text>
          </Pressable>

          {/* Login Link */}
          <View className="flex-row justify-center mt-2">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                router.push("/login")
              }}
            >
              <Text className="font-bold" style={{ color: "#f91928" }}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="mt-8">
          <Text className="text-gray-500 text-sm text-center">
            Powered by Tharu Senevirathne
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default Register
