import { View, Text } from "react-native"
import React from "react"
import { MaterialIcons } from "@expo/vector-icons"

const AdminProfile = () => {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-8 px-6 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-900 text-3xl font-bold">Admin Profile</Text>
            <Text className="text-blue-600 text-base mt-1 font-medium">Account settings</Text>
          </View>
          <View className="w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center">
            <MaterialIcons name="admin-panel-settings" size={28} color="white" />
          </View>
        </View>
      </View>
      <View className="flex-1 items-center justify-center">
        <MaterialIcons name="admin-panel-settings" size={64} color="#d1d5db" />
        <Text className="text-gray-500 mt-4">Admin profile coming soon</Text>
      </View>
    </View>
  )
}

export default AdminProfile