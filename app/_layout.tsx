// import React from "react";
// import { Slot } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useFonts } from 'expo-font';
// import * as SplashScreen from 'expo-splash-screen';
// import { MaterialIcons } from '@expo/vector-icons';
// import { useEffect } from 'react';

// // RootLayout component that wraps the app content in a SafeAreaView
// const RootLayout = () => {
//     return (
//         <SafeAreaView style={{ flex: 1 }}>
//             <Slot />
//         </SafeAreaView>
//     )
// }

// export default RootLayout



import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect } from "react";

// Splash screen එක auto hide වෙන එක prevent කරන්න
SplashScreen.preventAutoHideAsync();

// RootLayout component ඇතුළේ hooks භාවිතා කරන්න ඕන
const RootLayout = () => {
  // Fonts load කරන්න
  const [fontsLoaded, fontError] = useFonts({
    // MaterialIcons font එක preload කරනවා
    ...MaterialIcons.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Fonts load වුණාට පස්සේ splash screen hide කරන්න
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Fonts තාම load වෙලා නැත්නම් splash screen එක පෙන්වන්න (null හෝ custom loader)
  if (!fontsLoaded && !fontError) {
    return null; // හෝ <View><Text>Loading fonts...</Text></View>
  }

  // Fonts load උනාට පස්සේ normal content පෙන්වන්න
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Slot />
    </SafeAreaView>
  );
};

export default RootLayout;