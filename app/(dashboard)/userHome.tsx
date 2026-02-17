import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from "react-native"
import React, { useState, useEffect } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/services/firebase"
import { onSnapshot } from "firebase/firestore";

const UserHome = () => {
  const router = useRouter()
  const { user } = useAuth()
  
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pending: 0,
    resolved: 0,
  })

  const [recentComplaints, setRecentComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch user's complaint statistics and recent complaints
  useEffect(() => {
  if (!user?.uid) {
    setLoading(false);
    setStats({ totalComplaints: 0, pending: 0, resolved: 0 });
    setRecentComplaints([]);
    return;
  }

  setLoading(true);

  const complaintsRef = collection(db, 'complaints');
  const q = query(complaintsRef, where('userId', '==', user.uid));

  // Real-time listener
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    let total = 0;
    let pending = 0;
    let resolved = 0;
    const allComplaints: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const complaint = { id: doc.id, ...data };
      allComplaints.push(complaint);
      total++;
      if (data.status === 'pending') pending++;
      else if (data.status === 'resolved') resolved++;
    });

    setStats({ totalComplaints: total, pending, resolved });

    // Sort by createdAt descending & take latest 3
    const sorted = allComplaints
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 3);

    setRecentComplaints(sorted);

    setLoading(false);
  }, (error) => {
    console.error('Firestore listener error:', error);
    setLoading(false);
  });

  // Cleanup: unsubscribe when component unmounts or user changes
  return () => unsubscribe();
}, [user?.uid]);  

  const getStatusColor = (status: string) => {
    switch(status) {
      case "pending": return "bg-yellow-500"
      case "resolved": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch(status) {
      case "pending": return "Pending"
      case "resolved": return "Resolved"
      default: return status
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    
    try {
      // Handle Firestore Timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'N/A'
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
            <Text className="text-gray-900 text-3xl font-bold mt-1">
              {stats.totalComplaints}
            </Text>
          </View>
          <View className="bg-blue-600 rounded-2xl p-4 flex-1 ml-2 shadow-md">
            <Text className="text-blue-100 text-sm font-medium">Pending</Text>
            <Text className="text-white text-3xl font-bold mt-1">
              {stats.pending}
            </Text>
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
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-yellow-50 items-center justify-center mr-3">
                  <View className="w-3 h-3 rounded-full bg-yellow-500" />
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
          
          {recentComplaints.length === 0 ? (
            <View className="py-8 items-center">
              <MaterialIcons name="inbox" size={48} color="#d1d5db" />
              <Text className="text-gray-400 mt-2">No complaints yet</Text>
              <TouchableOpacity
                onPress={() => router.push("/addComplaint")}
                className="mt-4 bg-blue-600 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-semibold">Create First Complaint</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentComplaints.map((complaint, index) => (
              <TouchableOpacity 
                key={complaint.id}
                className={`flex-row items-center py-4 ${
                  index !== recentComplaints.length - 1 ? 'border-b border-gray-100' : ''
                }`}
                onPress={() => router.push("/complaintBox")}
              >
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold text-base" numberOfLines={1}>
                    {complaint.title}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    {formatDate(complaint.createdAt)}
                  </Text>
                </View>
                <View className={`px-3 py-1.5 rounded-full ${getStatusColor(complaint.status)}`}>
                  <Text className="text-white text-xs font-semibold">
                    {getStatusText(complaint.status)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default UserHome