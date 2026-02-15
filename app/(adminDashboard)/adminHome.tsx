import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import React, { useState, useEffect } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore"
import { db } from "@/services/firebase"

const AdminHome = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    resolvedToday: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  // Fetch all statistics
  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      // 1. Get all users count
      const usersRef = collection(db, 'users')
      const usersSnapshot = await getDocs(usersRef)
      const totalUsers = usersSnapshot.size

      // 2. Get all complaints
      const complaintsRef = collection(db, 'complaints')
      const complaintsSnapshot = await getDocs(complaintsRef)

      let totalComplaints = 0
      let pending = 0
      let inProgress = 0
      let resolved = 0
      let resolvedToday = 0

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      complaintsSnapshot.forEach((doc) => {
        const data = doc.data()
        totalComplaints++

        if (data.status === 'pending') {
          pending++
        } else if (data.status === 'in-progress') {
          inProgress++
        } else if (data.status === 'resolved') {
          resolved++
          
          // Check if resolved today
          if (data.updatedAt) {
            try {
              const updatedDate = data.updatedAt.toDate()
              if (updatedDate >= today) {
                resolvedToday++
              }
            } catch (error) {
              console.error('Error parsing date:', error)
            }
          }
        }
      })

      setStats({
        totalUsers,
        totalComplaints,
        pendingComplaints: pending,
        inProgressComplaints: inProgress,
        resolvedComplaints: resolved,
        resolvedToday
      })

      // 3. Get recent activity (last 10 complaints)
      try {
        const recentComplaintsQuery = query(
          complaintsRef,
          orderBy('createdAt', 'desc'),
          limit(10)
        )
        const recentSnapshot = await getDocs(recentComplaintsQuery)

        const activities: any[] = []
        recentSnapshot.forEach((doc) => {
          const data = doc.data()
          
          let activityMessage = ''
          let activityType = 'new'
          
          if (data.status === 'resolved') {
            activityMessage = `Complaint "${data.title}" marked as resolved`
            activityType = 'resolved'
          } else if (data.status === 'in-progress') {
            activityMessage = `Complaint "${data.title}" is in progress`
            activityType = 'in-progress'
          } else {
            activityMessage = `New complaint: "${data.title}"`
            activityType = 'new'
          }

          activities.push({
            id: doc.id,
            type: activityType,
            message: activityMessage,
            timestamp: data.createdAt,
            status: data.status,
            title: data.title
          })
        })

        setRecentActivity(activities)
      } catch (error) {
        console.error('Error fetching recent activity:', error)
        setRecentActivity([])
      }

      if (isRefresh) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      if (isRefresh) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleRefresh = () => {
    fetchStats(true)
  }

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Just now'

    try {
      const date = timestamp.toDate()
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } catch (error) {
      return 'Recently'
    }
  }

  const getActivityColor = (type: string) => {
    switch(type) {
      case 'new': return 'bg-blue-500'
      case 'in-progress': return 'bg-yellow-500'
      case 'resolved': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-600 mt-4">Loading dashboard...</Text>
      </View>
    )
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
            <Text className="text-blue-600 text-base mt-1 font-medium">
              Overview & Management
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={refreshing}
            className="w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center"
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialIcons name="refresh" size={28} color="white" />
            )}
          </TouchableOpacity>
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
            <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center mb-3">
              <MaterialIcons name="assignment" size={24} color="#a855f7" />
            </View>
            <Text className="text-gray-500 text-sm font-medium">Total Complaints</Text>
            <Text className="text-gray-900 text-3xl font-bold mt-1">{stats.totalComplaints}</Text>
          </View>

          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 w-[48%]">
            <View className="w-10 h-10 rounded-xl bg-yellow-50 items-center justify-center mb-3">
              <MaterialIcons name="pending" size={24} color="#eab308" />
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

        {/* Additional Stats Row */}
        <View className="flex-row justify-between mb-4">
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-1 mr-2">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gray-500 text-xs font-medium">In Progress</Text>
                <Text className="text-gray-900 text-2xl font-bold mt-1">
                  {stats.inProgressComplaints}
                </Text>
              </View>
              <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                <MaterialIcons name="hourglass-empty" size={20} color="#3b82f6" />
              </View>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-1 ml-2">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gray-500 text-xs font-medium">Total Resolved</Text>
                <Text className="text-gray-900 text-2xl font-bold mt-1">
                  {stats.resolvedComplaints}
                </Text>
              </View>
              <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center">
                <MaterialIcons name="done-all" size={20} color="#22c55e" />
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-gray-900 text-lg font-bold mb-4">Quick Actions</Text>
          <View className="space-y-2">
            <TouchableOpacity 
              className="flex-row items-center py-3 border-b border-gray-100"
              onPress={() => router.push("/manageComplaints")}
            >
              <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
                <MaterialIcons name="assignment" size={20} color="#2563eb" />
              </View>
              <Text className="text-gray-700 font-medium flex-1">View All Complaints</Text>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center py-3 border-b border-gray-100"
              onPress={() => router.push("/manageUsers")}
            >
              <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-3">
                <MaterialIcons name="people" size={20} color="#22c55e" />
              </View>
              <Text className="text-gray-700 font-medium flex-1">Manage Users</Text>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center py-3"
              onPress={() => router.push("/analytics")}
            >
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
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-lg font-bold">Recent Activity</Text>
            {recentActivity.length > 0 && (
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                <Text className="text-green-600 text-xs font-bold">LIVE</Text>
              </View>
            )}
          </View>
          
          {recentActivity.length === 0 ? (
            <View className="py-8 items-center">
              <MaterialIcons name="inbox" size={48} color="#d1d5db" />
              <Text className="text-gray-400 mt-2">No recent activity</Text>
            </View>
          ) : (
            <View className="space-y-3">
              {recentActivity.map((activity, index) => (
                <View 
                  key={activity.id}
                  className={`flex-row items-start ${
                    index !== recentActivity.length - 1 ? 'pb-3 border-b border-gray-100' : ''
                  }`}
                >
                  <View className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)} mt-2 mr-3`} />
                  <View className="flex-1">
                    <Text className="text-gray-700 font-medium" numberOfLines={2}>
                      {activity.message}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      {getTimeAgo(activity.timestamp)}
                    </Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${
                    activity.status === 'pending' ? 'bg-yellow-100' :
                    activity.status === 'in-progress' ? 'bg-blue-100' :
                    'bg-green-100'
                  }`}>
                    <Text className={`text-xs font-semibold ${
                      activity.status === 'pending' ? 'text-yellow-700' :
                      activity.status === 'in-progress' ? 'text-blue-700' :
                      'text-green-700'
                    }`}>
                      {activity.status === 'pending' ? 'New' :
                       activity.status === 'in-progress' ? 'Active' :
                       'Done'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default AdminHome