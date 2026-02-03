import { View, Text, ActivityIndicator,Alert } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import "../global.css"

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [showSplash, setShowSplash] = useState(true);

  // Splash screen timer
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // 2.5 seconds

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    console.log("Auth state:", { user, loading });
    // Until the splash screen is shown or auth state is loading, don't redirect
    if (showSplash || loading) return;

const redirectUser = async () => {
  if (!user) {
    console.log("→ No user → go to login");
    router.replace("/(auth)/login");
    return;
  }

  console.log("→ User logged in. UID:", user.uid);
  console.log("→ Email:", user.email);

  try {
    const userDocRef = doc(db, "users", user.uid);
    console.log("→ Querying document path:", `users/${user.uid}`);

    const userDocSnap = await getDoc(userDocRef);

    console.log("→ Document exists?", userDocSnap.exists());

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      console.log("→ Full Firestore data:", userData);
      console.log("→ Role found:", userData?.role);

      if (userData?.role === "admin") {
        console.log("→ Role is admin → redirecting to adminHome");
        router.replace("/(adminDashboard)/adminHome");
      } else if (userData?.role === "user") {
        console.log("→ Role is user → redirecting to userHome");
        router.replace("/(dashboard)/userHome");
      } else {
        console.log("→ Unknown role:", userData?.role);
        router.replace("/(auth)/login");
      }
    } else {
      console.log("→ No document found for this UID in 'users' collection");
      router.replace("/(auth)/login");
    }
  } catch (err) {
    console.error("→ Firestore fetch error:", err);
    Alert.alert("Error", "Failed to check user role");
    router.replace("/(auth)/login");
  }
};

    redirectUser();
  }, [user, loading, showSplash, router]);

  // Splash screen and loading state
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

  // user is authenticated and splash screen is done, but role is still being determined
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#0356fc" />
    </View>
  );
}