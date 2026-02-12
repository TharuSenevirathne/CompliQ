import React from "react"
import { Tabs } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"

// Define the tabs with their respective names, icons, and titles
const tabs = [
  { name: "userHome", icon: "home", title: "Home" },
  { name: "complaintBox", icon: "inbox", title: "Complaints" },
  { name: "addComplaint", icon: "add-circle", title: "Add" },
  { name: "ai", icon: "psychology", title: "AI" },
  { name: "profile", icon: "person", title: "Profile" }
] as const

// DashboardLayout component that sets up the tab navigation
const DashboardLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563eb", 
        tabBarInactiveTintColor: "#9CA3AF", 
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name={tab.icon} color={color} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}

export default DashboardLayout