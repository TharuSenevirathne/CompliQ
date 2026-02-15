import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import "../global.css"

export default function Index() {
  const router = useRouter();
  const { loading } = useAuth();

  const [showSplash, setShowSplash] = useState(true);

  // Splash screen timer
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 6000); 

    return () => clearTimeout(splashTimer);
  }, []);


    useEffect(() => {
    if (!showSplash && !loading) {
      console.log("Splash done → forcing to login page");
      router.replace("/(auth)/login");
    }
  }, [showSplash, loading, router]);

  // Splash screen and loading state
  if (showSplash || loading) {
    return (
      <View className="flex-1 bg-white">
        {/* Decorative background circles */}
        <View className="absolute top-[-100] right-[-100] w-80 h-80 rounded-full bg-blue-50 opacity-50" />
        <View className="absolute bottom-[-80] left-[-80] w-72 h-72 rounded-full bg-blue-100 opacity-40" />
        
        {/* Main content */}
        <View className="flex-1 justify-center items-center px-8">
          {/* Logo container with shadow effect */}
          <View className="items-center mb-16">
            {/* Icon/Badge */}
            <View className="w-24 h-24 rounded-3xl bg-blue-600 justify-center items-center mb-6 shadow-lg">
              <Text className="text-white text-5xl font-bold">C</Text>
            </View>
            
            {/* App name */}
            <Text className="text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Compli-Q
            </Text>
            
            {/* Tagline */}
            <View className="items-center">
              <Text className="text-blue-600 text-base font-semibold tracking-wide">
                Smart Compliance Management
              </Text>
              <View className="flex-row items-center mt-2">
                <View className="w-8 h-0.5 bg-blue-300" />
                <Text className="mx-3 text-gray-400 text-sm">✨</Text>
                <View className="w-8 h-0.5 bg-blue-300" />
              </View>
            </View>
          </View>

          {/* Loading indicator with custom styling */}
          <View className="items-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-500 text-sm mt-4 font-medium">
              Loading your workspace...
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View className="absolute bottom-12 self-center items-center">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-blue-600 mr-2" />
            <Text className="text-gray-400 text-xs font-medium tracking-wide">
              Powered by Tharu Senevirathne
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // User is authenticated and splash screen is done
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <View className="items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-500 text-sm mt-4 font-medium">
          Preparing your dashboard...
        </Text>
      </View>
    </View>
  );
}