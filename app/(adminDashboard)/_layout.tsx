import React from "react"
import { Tabs } from "expo-router"
import { MaterialIcons, Ionicons } from "@expo/vector-icons"

// Define the tabs with their respective names, icons, and titles
const tabs = [
  { name: "home", icon: "home", title: "Home" },
  { name: "complaintBox", icon: "inbox", title: "Complaint Boxes" },
  { name: "addComplaint", icon: "add-circle", title: "Add Complaint" },
  { name: "ai", icon: "psychology", title: "AI Assistant" },
  { name: "profile", icon: "person", title: "Profile" }
] as const

// DashboardLayout component that sets up the tab navigation
const AdminLayout = () => {
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

export default AdminLayout