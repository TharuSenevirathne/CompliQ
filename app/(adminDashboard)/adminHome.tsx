import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import React from "react"
import { MaterialIcons } from "@expo/vector-icons"

const AdminHome = () => {
  const stats = {
    totalUsers: 145,
    totalComplaints: 234,
    pendingComplaints: 45,
    resolvedToday: 12
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Decorative background */}
      <View className="absolute top-[-100] right-[-100] w-80 h-80 rounded-full bg-blue-50 opacity-30" />
      
      {/* Header */}
      <View className="bg-white pt-14 pb-8 px-6 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-900 text-3xl font-bold">Admin Dashboard</Text>
            <Text className="text-blue-600 text-base mt-1 font-medium">Overview & Management</Text>
          </View>
          <View className="w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center">
            <MaterialIcons name="admin-panel-settings" size={28} color="white" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between mb-4">
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 w-[48%]">
            <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mb-3">
              <MaterialIcons name="people" size={24} color="#2563eb" />
            </View>
            <Text className="text-gray-500 text-sm font-medium">Total Users</Text>
            <Text className="text-gray-900 text-3xl font-bold mt-1">{stats.totalUsers}</Text>
          </View>

          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 w-[48%]">
            <View className="w-10 h-10 rounded-xl bg-yellow-50 items-center justify-center mb-3">
              <MaterialIcons name="assignment" size={24} color="#eab308" />
            </View>
            <Text className="text-gray-500 text-sm font-medium">Total Complaints</Text>
            <Text className="text-gray-900 text-3xl font-bold mt-1">{stats.totalComplaints}</Text>
          </View>

          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 w-[48%]">
            <View className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center mb-3">
              <MaterialIcons name="pending" size={24} color="#ef4444" />
            </View>
            <Text className="text-gray-500 text-sm font-medium">Pending</Text>
            <Text className="text-gray-900 text-3xl font-bold mt-1">{stats.pendingComplaints}</Text>
          </View>

          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 w-[48%]">
            <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mb-3">
              <MaterialIcons name="check-circle" size={24} color="#22c55e" />
            </View>
            <Text className="text-gray-500 text-sm font-medium">Resolved Today</Text>
            <Text className="text-gray-900 text-3xl font-bold mt-1">{stats.resolvedToday}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-gray-900 text-lg font-bold mb-4">Quick Actions</Text>
          <View className="space-y-2">
            <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
              <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
                <MaterialIcons name="assignment" size={20} color="#2563eb" />
              </View>
              <Text className="text-gray-700 font-medium flex-1">View All Complaints</Text>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
              <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-3">
                <MaterialIcons name="people" size={20} color="#22c55e" />
              </View>
              <Text className="text-gray-700 font-medium flex-1">Manage Users</Text>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center py-3">
              <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center mr-3">
                <MaterialIcons name="analytics" size={20} color="#a855f7" />
              </View>
              <Text className="text-gray-700 font-medium flex-1">View Analytics</Text>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
          <Text className="text-gray-900 text-lg font-bold mb-4">Recent Activity</Text>
          <View className="space-y-3">
            <View className="flex-row items-start">
              <View className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3" />
              <View className="flex-1">
                <Text className="text-gray-700 font-medium">New complaint submitted</Text>
                <Text className="text-gray-500 text-xs mt-1">2 minutes ago</Text>
              </View>
            </View>
            <View className="flex-row items-start">
              <View className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3" />
              <View className="flex-1">
                <Text className="text-gray-700 font-medium">Complaint marked as resolved</Text>
                <Text className="text-gray-500 text-xs mt-1">15 minutes ago</Text>
              </View>
            </View>
            <View className="flex-row items-start">
              <View className="w-2 h-2 rounded-full bg-yellow-500 mt-2 mr-3" />
              <View className="flex-1">
                <Text className="text-gray-700 font-medium">New user registered</Text>
                <Text className="text-gray-500 text-xs mt-1">1 hour ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default AdminHome