import { View, Text } from "react-native"
import React from "react"
import { MaterialIcons } from "@expo/vector-icons"

const ManageUsers = () => {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-8 px-6 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-900 text-3xl font-bold">Manage Users</Text>
            <Text className="text-blue-600 text-base mt-1 font-medium">User management</Text>
          </View>
          <View className="w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center">
            <MaterialIcons name="people" size={28} color="white" />
          </View>
        </View>
      </View>
      <View className="flex-1 items-center justify-center">
        <MaterialIcons name="people" size={64} color="#d1d5db" />
        <Text className="text-gray-500 mt-4">User management coming soon</Text>
      </View>
    </View>
  )
}

export default ManageUsers