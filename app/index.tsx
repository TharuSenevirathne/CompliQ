import { View, Text, ActivityIndicator } from "react-native"
import { useEffect } from "react"
import { useRouter } from "expo-router"
import "../global.css"

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(auth)/login")
    }, 6000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <View className="flex-1 justify-center items-center bg-black">
      {/* App Logo */}
      <View className="items-center mb-10">
        <Text className="text-6xl font-bold text-white mb-2">Compli-Q</Text>
        <Text className="text-blue-500 text-lg tracking-widest">
          The best way to manage compliance 💕
        </Text>
      </View>

      <ActivityIndicator size="large" color="#0356fc" />

      <View className="absolute bottom-10">
        <Text className="text-gray-400 text-sm">
          Powered by Tharu Senevirathne
        </Text>
      </View>
    </View>
  )
}
