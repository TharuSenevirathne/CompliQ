import React from "react";
import { Slot, Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";

// Prevent the splash screen from auto-hiding while we check auth state and load fonts
SplashScreen.preventAutoHideAsync();

// Root layout that wraps the entire app with AuthProvider and manages auth flow
const RootLayout = () => {
  const [fontsLoaded, fontError] = useFonts({
    ...MaterialIcons.font,
  });

  // Hide splash screen once fonts are loaded or if there's an error (to avoid infinite splash)
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Main layout with auth context and flow manager
  return (
    <AuthProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <AuthFlowManager />
        <Slot />
      </SafeAreaView>
    </AuthProvider>
  );
};

// Component to manage authentication flow and redirects
function AuthFlowManager() {
  const { user, initializing } = useAuth();

  // Auth state is still initializing → show nothing (splash is still visible)
  if (initializing) {
    return null; 
  }

  // No user → redirect to login page (replace to prevent back navigation)
  if (!user) {
    return <Redirect href="/(auth)/login" />; 
  }

  // User is authenticated → render the app (Slot will render the current route)
  return null;
}

export default RootLayout;