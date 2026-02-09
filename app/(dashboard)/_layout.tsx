import React from "react"
import { Tabs } from "expo-router"
import { MaterialIcons, Ionicons } from "@expo/vector-icons"

// Define the tabs with their respective names, icons, and titles
const tabs = [
  { name: "Home", icon: "inbox", title: "Home" },
  { name: "Complaint Boxes", icon: "inbox", title: "Complaint Boxes" },
  { name: "Add Complaint", icon: "add-circle", title: "Add Complaint" },
  { name: "AI Assistant", icon: "psychology", title: "AI Assistant" },
  { name: "Profile", icon: "person", title: "Profile" }
] as const

// DashboardLayout component that sets up the tab navigation
const DashboardLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          name={tab.name}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name={tab.icon} color={color} size={size} />
            )
          }}
        />
      ))}
    </Tabs>
  )
}

export default DashboardLayout