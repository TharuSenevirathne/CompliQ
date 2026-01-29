import { View,Text,TextInput,Pressable,TouchableOpacity,TouchableWithoutFeedback,Keyboard} from "react-native"
import React from "react"
import { useRouter } from "expo-router"

const Login = () => {
  const router = useRouter()
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
          />

          {/* Password Input */}
          <TextInput
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            className="border-2 border-gray-200 bg-gray-50 p-4 mb-6 rounded-xl text-black"
            secureTextEntry
          />

          {/* Login Button */}
          <Pressable
            className="px-6 py-4 rounded-xl mb-4"
            style={{ backgroundColor: "#0356fc" }}
            onPress={() => {
              router.replace("/home")
            }}
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