import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import "../global.css"

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Splash screen එක පෙන්වන්න කී කාලයක්ද කියලා control කරන්න
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Splash screen එක අවම වශයෙන් 2-3 තත්පරයක් පෙන්වන්න
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // 2.5 seconds

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    // Splash screen එක ඉවර වෙනකම් redirect කරන්න එපා
    if (showSplash || loading) return;

    const redirectUser = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();

          console.log("Current Firebase User:", user);

          if (userData?.role === "admin") {
            router.replace("/(admin)/adminHome");
          } else {
            router.replace("/(dashboard)/userHome"); // user dashboard එකට
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          router.replace("/(auth)/login");
        }
      } else {
        router.replace("/(auth)/login");
      }
    };

    redirectUser();
  }, [user, loading, showSplash, router]);

  // Splash screen එක පෙන්වන වෙලාව
  if (showSplash || loading) {
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
    );
  }

  // Loading state එක (redirect වෙනකන් පෙන්නන්න)
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#0356fc" />
    </View>
  );
}