import { View, Text, ScrollView, TouchableOpacity, StatusBar } from "react-native"
import React from "react"
import { MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

const UserHome = () => {

  const router = useRouter()
  
  const stats = {
    totalComplaints: 12,
    pending: 5,
    resolved: 7,
    inProgress: 3
  }

  const recentComplaints = [
    { id: 1, title: "Street Light Issue", status: "pending", date: "2024-02-08" },
    { id: 2, title: "Garbage Collection", status: "in-progress", date: "2024-02-07" },
    { id: 3, title: "Road Damage", status: "resolved", date: "2024-02-06" }
  ]

  const getStatusColor = (status: string) => {
    switch(status) {
      case "pending": return "bg-red-500"
      case "in-progress": return "bg-yellow-500"
      case "resolved": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch(status) {
      case "pending": return "Pending"
      case "in-progress": return "In Progress"
      case "resolved": return "Resolved"
      default: return status
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Decorative background circles */}
      <View className="absolute top-[-100] right-[-100] w-80 h-80 rounded-full bg-blue-50 opacity-30" />
      
      {/* Header */}
      <View className="bg-white pt-14 pb-8 px-6 shadow-sm">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-900 text-3xl font-bold">Welcome Back</Text>
            <Text className="text-blue-600 text-base mt-1 font-medium">Track your complaints</Text>
          </View>
          <View className="w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center">
            <Text className="text-white text-xl font-bold">C</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="flex-row justify-between mt-2">
          <View className="bg-blue-50 rounded-2xl p-4 flex-1 mr-2 border border-blue-100">
            <Text className="text-blue-600 text-sm font-medium">Total</Text>
            <Text className="text-gray-900 text-3xl font-bold mt-1">{stats.totalComplaints}</Text>
          </View>
          <View className="bg-blue-600 rounded-2xl p-4 flex-1 ml-2 shadow-md">
            <Text className="text-blue-100 text-sm font-medium">Pending</Text>
            <Text className="text-white text-3xl font-bold mt-1">{stats.pending}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 mt-6" showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-5 border border-gray-100">
          <Text className="text-gray-900 text-lg font-bold mb-4">Quick Actions</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="items-center flex-1"
              onPress={() => {
                router.push("/addComplaint")
              }} 
            >
              <View className="bg-blue-600 p-4 rounded-2xl mb-2 shadow-md">
                <MaterialIcons name="add-circle" size={28} color="white" />
              </View>
              <Text className="text-gray-700 text-xs text-center font-medium">New Complaint</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="items-center flex-1"
              onPress={() => {
                router.push("/ai")
              }} 
            >
              <View className="bg-blue-500 p-4 rounded-2xl mb-2 shadow-md">
                <MaterialIcons name="psychology" size={28} color="white" />
              </View>
              <Text className="text-gray-700 text-xs text-center font-medium">AI Assistant</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="items-center flex-1"
              onPress={() => {
                router.push("/complaintBox")
              }} 
            >
              <View className="bg-gray-700 p-4 rounded-2xl mb-2 shadow-md">
                <MaterialIcons name="inbox" size={28} color="white" />
              </View>
              <Text className="text-gray-700 text-xs text-center font-medium">View All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Overview */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-5 border border-gray-100">
          <Text className="text-gray-900 text-lg font-bold mb-4">Status Overview</Text>
          <View className="space-y-2">
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-3">
                  <View className="w-3 h-3 rounded-full bg-green-500" />
                </View>
                <Text className="text-gray-700 font-medium">Resolved</Text>
              </View>
              <Text className="text-gray-900 font-bold text-lg">{stats.resolved}</Text>
            </View>
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-yellow-50 items-center justify-center mr-3">
                  <View className="w-3 h-3 rounded-full bg-yellow-500" />
                </View>
                <Text className="text-gray-700 font-medium">In Progress</Text>
              </View>
              <Text className="text-gray-900 font-bold text-lg">{stats.inProgress}</Text>
            </View>
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center mr-3">
                  <View className="w-3 h-3 rounded-full bg-red-500" />
                </View>
                <Text className="text-gray-700 font-medium">Pending</Text>
              </View>
              <Text className="text-gray-900 font-bold text-lg">{stats.pending}</Text>
            </View>
          </View>
        </View>

        {/* Recent Complaints */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-8 border border-gray-100">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-900 text-lg font-bold">Recent Complaints</Text>
            <TouchableOpacity
              onPress={() => {
                router.push("/complaintBox")
              }} 
            >
              <Text className="text-blue-600 text-sm font-semibold">View All →</Text>
            </TouchableOpacity>
          </View>
          
          {recentComplaints.map((complaint, index) => (
            <TouchableOpacity 
              key={complaint.id}
              className={`flex-row items-center py-4 ${index !== recentComplaints.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-base">{complaint.title}</Text>
                <Text className="text-gray-500 text-xs mt-1">{complaint.date}</Text>
              </View>
              <View className={`px-3 py-1.5 rounded-full ${getStatusColor(complaint.status)}`}>
                <Text className="text-white text-xs font-semibold">
                  {getStatusText(complaint.status)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default UserHome