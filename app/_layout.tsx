import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// RootLayout component that wraps the app content in a SafeAreaView
const RootLayout = () => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Slot />
        </SafeAreaView>
    )
}

export default RootLayout