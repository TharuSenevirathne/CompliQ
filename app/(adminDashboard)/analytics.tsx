import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native"
import React, { useState, useEffect } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import { collection, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/services/firebase"

const Analytics = () => {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')
  
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    totalUsers: 0,
    avgResolutionTime: 0,
    todayComplaints: 0,
    weekComplaints: 0,
    monthComplaints: 0
  })

  const [typeBreakdown, setTypeBreakdown] = useState<any[]>([])
  const [priorityBreakdown, setPriorityBreakdown] = useState<any[]>([])
  const [resolutionRate, setResolutionRate] = useState(0)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // Get all complaints
      const complaintsRef = collection(db, 'complaints')
      const complaintsSnapshot = await getDocs(complaintsRef)

      let total = 0
      let pending = 0
      let inProgress = 0
      let resolved = 0
      let todayCount = 0
      let weekCount = 0
      let monthCount = 0

      const typeCount: any = {}
      const priorityCount: any = { low: 0, medium: 0, high: 0 }

      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      complaintsSnapshot.forEach((doc) => {
        const data = doc.data()
        total++

        // Status count
        if (data.status === 'pending') pending++
        else if (data.status === 'in-progress') inProgress++
        else if (data.status === 'resolved') resolved++

        // Type count
        const type = data.type || 'other'
        typeCount[type] = (typeCount[type] || 0) + 1

        // Priority count
        const priority = data.priority || 'medium'
        if (priorityCount[priority] !== undefined) {
          priorityCount[priority]++
        }

        // Time-based counts
        if (data.createdAt) {
          const createdDate = data.createdAt.toDate()
          if (createdDate >= todayStart) todayCount++
          if (createdDate >= weekStart) weekCount++
          if (createdDate >= monthStart) monthCount++
        }
      })

      // Get users count
      const usersRef = collection(db, 'users')
      const usersSnapshot = await getDocs(usersRef)
      const totalUsers = usersSnapshot.size

      // Calculate resolution rate
      const rate = total > 0 ? Math.round((resolved / total) * 100) : 0

      // Type breakdown for chart
      const types = Object.keys(typeCount).map(key => ({
        name: key,
        count: typeCount[key],
        percentage: Math.round((typeCount[key] / total) * 100)
      }))

      // Priority breakdown
      const priorities = [
        { name: 'high', count: priorityCount.high, color: 'bg-red-500' },
        { name: 'medium', count: priorityCount.medium, color: 'bg-yellow-500' },
        { name: 'low', count: priorityCount.low, color: 'bg-green-500' }
      ]

      setStats({
        totalComplaints: total,
        pending,
        inProgress,
        resolved,
        totalUsers,
        avgResolutionTime: 2.5, // Mock data - calculate from actual resolution times
        todayComplaints: todayCount,
        weekComplaints: weekCount,
        monthComplaints: monthCount
      })

      setTypeBreakdown(types)
      setPriorityBreakdown(priorities)
      setResolutionRate(rate)

      setLoading(false)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'road': return 'road'
      case 'waste': return 'delete'
      case 'water': return 'water-drop'
      case 'electricity': return 'electrical-services'
      case 'noise': return 'volume-up'
      default: return 'more-horiz'
    }
  }

  const getTypeColor = (type: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500']
    const types = ['road', 'waste', 'water', 'electricity', 'noise', 'other']
    const index = types.indexOf(type)
    return index >= 0 ? colors[index] : colors[colors.length - 1]
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-600 mt-4">Loading analytics...</Text>
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
            <Text className="text-gray-900 text-3xl font-bold">Analytics</Text>
            <Text className="text-blue-600 text-base mt-1 font-medium">Reports & insights</Text>
          </View>
          <TouchableOpacity
            onPress={fetchAnalytics}
            className="w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center"
          >
            <MaterialIcons name="refresh" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
        {/* Overview Stats */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-gray-900 text-lg font-bold mb-4">Overview</Text>
          
          <View className="flex-row flex-wrap justify-between">
            <View className="w-[48%] bg-blue-50 rounded-xl p-4 mb-3">
              <MaterialIcons name="assignment" size={24} color="#2563eb" />
              <Text className="text-blue-600 text-2xl font-bold mt-2">
                {stats.totalComplaints}
              </Text>
              <Text className="text-gray-600 text-xs mt-1">Total Complaints</Text>
            </View>

            <View className="w-[48%] bg-purple-50 rounded-xl p-4 mb-3">
              <MaterialIcons name="people" size={24} color="#a855f7" />
              <Text className="text-purple-600 text-2xl font-bold mt-2">
                {stats.totalUsers}
              </Text>
              <Text className="text-gray-600 text-xs mt-1">Total Users</Text>
            </View>

            <View className="w-[48%] bg-green-50 rounded-xl p-4 mb-3">
              <MaterialIcons name="check-circle" size={24} color="#22c55e" />
              <Text className="text-green-600 text-2xl font-bold mt-2">
                {resolutionRate}%
              </Text>
              <Text className="text-gray-600 text-xs mt-1">Resolution Rate</Text>
            </View>

            <View className="w-[48%] bg-orange-50 rounded-xl p-4 mb-3">
              <MaterialIcons name="schedule" size={24} color="#f97316" />
              <Text className="text-orange-600 text-2xl font-bold mt-2">
                {stats.avgResolutionTime}d
              </Text>
              <Text className="text-gray-600 text-xs mt-1">Avg. Resolution</Text>
            </View>
          </View>
        </View>

        {/* Time-based Stats */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-gray-900 text-lg font-bold mb-4">Activity Timeline</Text>
          
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
                <MaterialIcons name="today" size={20} color="#2563eb" />
              </View>
              <Text className="text-gray-700 font-medium">Today</Text>
            </View>
            <Text className="text-gray-900 font-bold text-lg">{stats.todayComplaints}</Text>
          </View>

          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-3">
                <MaterialIcons name="date-range" size={20} color="#22c55e" />
              </View>
              <Text className="text-gray-700 font-medium">This Week</Text>
            </View>
            <Text className="text-gray-900 font-bold text-lg">{stats.weekComplaints}</Text>
          </View>

          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center mr-3">
                <MaterialIcons name="calendar-month" size={20} color="#a855f7" />
              </View>
              <Text className="text-gray-700 font-medium">This Month</Text>
            </View>
            <Text className="text-gray-900 font-bold text-lg">{stats.monthComplaints}</Text>
          </View>
        </View>

        {/* Status Distribution */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-gray-900 text-lg font-bold mb-4">Status Distribution</Text>
          
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-700 font-medium">Pending</Text>
              <Text className="text-gray-600 font-semibold">{stats.pending}</Text>
            </View>
            <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <View 
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: `${stats.totalComplaints > 0 ? (stats.pending / stats.totalComplaints) * 100 : 0}%` }}
              />
            </View>
          </View>

          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-700 font-medium">In Progress</Text>
              <Text className="text-gray-600 font-semibold">{stats.inProgress}</Text>
            </View>
            <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <View 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${stats.totalComplaints > 0 ? (stats.inProgress / stats.totalComplaints) * 100 : 0}%` }}
              />
            </View>
          </View>

          <View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-700 font-medium">Resolved</Text>
              <Text className="text-gray-600 font-semibold">{stats.resolved}</Text>
            </View>
            <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <View 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${stats.totalComplaints > 0 ? (stats.resolved / stats.totalComplaints) * 100 : 0}%` }}
              />
            </View>
          </View>
        </View>

        {/* Type Breakdown */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-gray-900 text-lg font-bold mb-4">Complaints by Type</Text>
          
          {typeBreakdown.length === 0 ? (
            <Text className="text-gray-400 text-center py-4">No data available</Text>
          ) : (
            typeBreakdown.map((item, index) => (
              <View key={index} className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                    <View className={`w-8 h-8 rounded-lg ${getTypeColor(item.name)} items-center justify-center mr-3`}>
                      <MaterialIcons name={getTypeIcon(item.name) as any} size={16} color="white" />
                    </View>
                    <Text className="text-gray-700 font-medium capitalize">{item.name}</Text>
                  </View>
                  <Text className="text-gray-600 font-semibold">{item.count} ({item.percentage}%)</Text>
                </View>
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View 
                    className={`h-full ${getTypeColor(item.name)} rounded-full`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </View>
              </View>
            ))
          )}
        </View>

        {/* Priority Breakdown */}
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
          <Text className="text-gray-900 text-lg font-bold mb-4">Priority Breakdown</Text>
          
          <View className="flex-row justify-between">
            {priorityBreakdown.map((item, index) => (
              <View key={index} className="flex-1 mx-1 items-center">
                <View className={`w-16 h-16 rounded-full ${item.color} items-center justify-center mb-2`}>
                  <Text className="text-white text-2xl font-bold">{item.count}</Text>
                </View>
                <Text className="text-gray-700 font-semibold capitalize text-sm">{item.name}</Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {stats.totalComplaints > 0 ? Math.round((item.count / stats.totalComplaints) * 100) : 0}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Key Insights */}
        <View className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 mb-6 shadow-md">
          <View className="flex-row items-center mb-4">
            <MaterialIcons name="lightbulb" size={24} color="white" />
            <Text className="text-white text-lg font-bold ml-2">Key Insights</Text>
          </View>
          
          <View className="space-y-3">
            <View className="flex-row items-start">
              <View className="w-2 h-2 rounded-full bg-blue-200 mt-2 mr-3" />
              <Text className="text-white flex-1">
                {resolutionRate}% of complaints have been successfully resolved
              </Text>
            </View>
            <View className="flex-row items-start">
              <View className="w-2 h-2 rounded-full bg-blue-200 mt-2 mr-3" />
              <Text className="text-white flex-1">
                {stats.pending} complaints are waiting for action
              </Text>
            </View>
            <View className="flex-row items-start">
              <View className="w-2 h-2 rounded-full bg-blue-200 mt-2 mr-3" />
              <Text className="text-white flex-1">
                Average resolution time is {stats.avgResolutionTime} days
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default Analytics