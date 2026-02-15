import React from "react"
import { Tabs } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"

// Define the tabs with their respective names, icons, and titles
const adminTabs = [
  { name: "adminHome", icon: "dashboard", title: "Dashboard" },
  { name: "manageComplaints", icon: "assignment", title: "Complaints" },
  { name: "manageUsers", icon: "people", title: "Users" },
  { name: "analytics", icon: "analytics", title: "Analytics" },
  { name: "adminProfile", icon: "admin-panel-settings", title: "Admin" }
] as const

// AdminLayout component that sets up the tab navigation
const AdminLayout = () => {
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
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {adminTabs.map((tab) => (
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

export default AdminLayout