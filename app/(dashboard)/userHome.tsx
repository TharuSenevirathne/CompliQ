import { View, Text, ScrollView, TouchableOpacity, StatusBar } from "react-native"
import React from "react"
import { MaterialIcons } from "@expo/vector-icons"

const UserHome = () => {
  
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
      case "pending": return "bg-yellow-500"
      case "in-progress": return "bg-blue-500"
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
    <View className="flex-1 bg-gray-100">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="bg-black pt-12 pb-8 px-6 rounded-b-3xl">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white text-3xl font-bold">WELCOME BACK 👀</Text>
            <Text className="text-gray-400 text-base mt-1">Track your complaints</Text>
          </View>
          {/* <TouchableOpacity className="bg-gray-800 p-3 rounded-full">
            <MaterialIcons name="notifications" size={24} color="white" />
          </TouchableOpacity> */}
        </View>

        {/* Stats Cards */}
        <View className="flex-row justify-between mt-4">
          <View className="bg-gray-900 rounded-2xl p-4 flex-1 mr-2 border border-gray-800">
            <Text className="text-gray-400 text-sm">Total</Text>
            <Text className="text-white text-3xl font-bold mt-1">{stats.totalComplaints}</Text>
          </View>
          <View className="bg-blue-600 rounded-2xl p-4 flex-1 ml-2">
            <Text className="text-blue-200 text-sm">Pending</Text>
            <Text className="text-white text-3xl font-bold mt-1">{stats.pending}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 -mt-6">
        {/* Quick Actions */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <Text className="text-black text-lg font-semibold mb-4">Quick Actions</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="items-center flex-1">
              <View className="bg-black p-4 rounded-2xl mb-2">
                <MaterialIcons name="add-circle" size={32} color="white" />
              </View>
              <Text className="text-gray-700 text-xs text-center">New Complaint</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center flex-1">
              <View className="bg-blue-600 p-4 rounded-2xl mb-2">
                <MaterialIcons name="psychology" size={32} color="white" />
              </View>
              <Text className="text-gray-700 text-xs text-center">AI Assistant</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center flex-1">
              <View className="bg-gray-800 p-4 rounded-2xl mb-2">
                <MaterialIcons name="inbox" size={32} color="white" />
              </View>
              <Text className="text-gray-700 text-xs text-center">View All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Overview */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <Text className="text-black text-lg font-semibold mb-4">Status Overview</Text>
          <View className="space-y-3">
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-green-500 mr-3" />
                <Text className="text-gray-700">Resolved</Text>
              </View>
              <Text className="text-black font-semibold">{stats.resolved}</Text>
            </View>
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-blue-500 mr-3" />
                <Text className="text-gray-700">In Progress</Text>
              </View>
              <Text className="text-black font-semibold">{stats.inProgress}</Text>
            </View>
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-yellow-500 mr-3" />
                <Text className="text-gray-700">Pending</Text>
              </View>
              <Text className="text-black font-semibold">{stats.pending}</Text>
            </View>
          </View>
        </View>

        {/* Recent Complaints */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-black text-lg font-semibold">Recent Complaints</Text>
            <TouchableOpacity>
              <Text className="text-blue-600 text-sm font-medium">View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentComplaints.map((complaint) => (
            <TouchableOpacity 
              key={complaint.id}
              className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
            >
              <View className={`w-2 h-2 rounded-full ${getStatusColor(complaint.status)} mr-3`} />
              <View className="flex-1">
                <Text className="text-black font-medium">{complaint.title}</Text>
                <Text className="text-gray-500 text-xs mt-1">{complaint.date}</Text>
              </View>
              <View className={`px-3 py-1 rounded-full ${getStatusColor(complaint.status)}`}>
                <Text className="text-white text-xs font-medium">
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