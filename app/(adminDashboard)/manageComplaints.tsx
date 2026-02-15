import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from "react-native"
import React, { useState, useEffect } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/services/firebase"

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState<any[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState("")

  // Fetch all complaints from Firebase
  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const complaintsRef = collection(db, 'complaints')
      const q = query(complaintsRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)

      const complaintsData: any[] = []
      querySnapshot.forEach((doc) => {
        complaintsData.push({
          id: doc.id,
          ...doc.data()
        })
      })

      setComplaints(complaintsData)
      setFilteredComplaints(complaintsData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching complaints:', error)
      setLoading(false)
      Alert.alert('Error', 'Failed to load complaints')
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  // Filter and search
  useEffect(() => {
    let filtered = complaints

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus)
    }

    // Search
    if (searchQuery.trim()) {
      filtered = filtered.filter(c =>
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredComplaints(filtered)
  }, [searchQuery, filterStatus, complaints])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500"
      case "in-progress": return "bg-blue-500"
      case "resolved": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pending"
      case "in-progress": return "In Progress"
      case "resolved": return "Resolved"
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "text-green-500"
      case "medium": return "text-yellow-500"
      case "high": return "text-red-500"
      default: return "text-gray-500"
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    try {
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

  const handleViewDetails = (complaint: any) => {
    setSelectedComplaint(complaint)
    setShowDetailModal(true)
  }

  const handleChangeStatus = (complaint: any) => {
    setSelectedComplaint(complaint)
    setNewStatus(complaint.status)
    setShowStatusModal(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedComplaint || !newStatus) return

    try {
      const complaintRef = doc(db, 'complaints', selectedComplaint.id)
      await updateDoc(complaintRef, {
        status: newStatus,
        updatedAt: new Date()
      })

      Alert.alert('Success', 'Complaint status updated successfully')
      setShowStatusModal(false)
      await fetchComplaints()
    } catch (error) {
      console.error('Error updating status:', error)
      Alert.alert('Error', 'Failed to update complaint status')
    }
  }

  const handleDeleteComplaint = (complaint: any) => {
    Alert.alert(
      'Delete Complaint',
      'Are you sure you want to delete this complaint? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'complaints', complaint.id))
              Alert.alert('Success', 'Complaint deleted successfully')
              setShowDetailModal(false)
              await fetchComplaints()
            } catch (error) {
              console.error('Error deleting complaint:', error)
              Alert.alert('Error', 'Failed to delete complaint')
            }
          }
        }
      ]
    )
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-600 mt-4">Loading complaints...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Decorative background */}
      <View className="absolute top-[-100] right-[-100] w-80 h-80 rounded-full bg-blue-50 opacity-30" />

      {/* Header */}
      <View className="bg-white pt-14 pb-6 px-6 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-900 text-3xl font-bold">Manage Complaints</Text>
            <Text className="text-blue-600 text-base mt-1 font-medium">
              {complaints.length} Total Complaints
            </Text>
          </View>
          <TouchableOpacity
            onPress={fetchComplaints}
            className="w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center"
          >
            <MaterialIcons name="refresh" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 px-6">
        {/* Search Bar */}
        <View className="bg-white rounded-2xl p-3 mt-4 flex-row items-center shadow-sm border border-gray-100">
          <MaterialIcons name="search" size={24} color="#2563eb" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Search complaints..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialIcons name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Buttons */}
        <View className="mt-4 mb-2">
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={() => setFilterStatus("all")}
              className={`flex-1 py-3 rounded-xl mr-2 ${
                filterStatus === "all" 
                  ? "bg-blue-600" 
                  : "bg-white border-2 border-gray-200"
              }`}
            >
              <Text className={`text-center font-bold text-xs ${
                filterStatus === "all" ? "text-white" : "text-gray-600"
              }`}>
                All
              </Text>
              <Text className={`text-center text-xs mt-1 ${
                filterStatus === "all" ? "text-blue-100" : "text-gray-400"
              }`}>
                {complaints.length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilterStatus("pending")}
              className={`flex-1 py-3 rounded-xl mx-1 ${
                filterStatus === "pending" 
                  ? "bg-yellow-500" 
                  : "bg-white border-2 border-gray-200"
              }`}
            >
              <Text className={`text-center font-bold text-xs ${
                filterStatus === "pending" ? "text-white" : "text-gray-600"
              }`}>
                Pending
              </Text>
              <Text className={`text-center text-xs mt-1 ${
                filterStatus === "pending" ? "text-yellow-100" : "text-gray-400"
              }`}>
                {complaints.filter(c => c.status === "pending").length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilterStatus("in-progress")}
              className={`flex-1 py-3 rounded-xl mx-1 ${
                filterStatus === "in-progress" 
                  ? "bg-blue-500" 
                  : "bg-white border-2 border-gray-200"
              }`}
            >
              <Text className={`text-center font-bold text-xs ${
                filterStatus === "in-progress" ? "text-white" : "text-gray-600"
              }`}>
                Active
              </Text>
              <Text className={`text-center text-xs mt-1 ${
                filterStatus === "in-progress" ? "text-blue-100" : "text-gray-400"
              }`}>
                {complaints.filter(c => c.status === "in-progress").length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilterStatus("resolved")}
              className={`flex-1 py-3 rounded-xl ml-2 ${
                filterStatus === "resolved" 
                  ? "bg-green-500" 
                  : "bg-white border-2 border-gray-200"
              }`}
            >
              <Text className={`text-center font-bold text-xs ${
                filterStatus === "resolved" ? "text-white" : "text-gray-600"
              }`}>
                Resolved
              </Text>
              <Text className={`text-center text-xs mt-1 ${
                filterStatus === "resolved" ? "text-green-100" : "text-gray-400"
              }`}>
                {complaints.filter(c => c.status === "resolved").length}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Complaints List */}
        <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
          {filteredComplaints.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center justify-center mt-8 border border-gray-100">
              <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center mb-4">
                <MaterialIcons name="inbox" size={40} color="#2563eb" />
              </View>
              <Text className="text-gray-900 text-lg font-bold">No complaints found</Text>
              <Text className="text-gray-500 text-sm mt-2">Try adjusting your search or filter</Text>
            </View>
          ) : (
            filteredComplaints.map((complaint) => (
              <View key={complaint.id} className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-gray-100">
                {/* Header */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 mr-3">
                    <Text className="text-gray-900 font-bold text-base" numberOfLines={2}>
                      {complaint.title}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      {formatDate(complaint.createdAt)}
                    </Text>
                  </View>
                  <View className={`px-3 py-1.5 rounded-full ${getStatusColor(complaint.status)}`}>
                    <Text className="text-white text-xs font-bold">
                      {getStatusText(complaint.status)}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text className="text-gray-600 text-sm mb-3 leading-5" numberOfLines={2}>
                  {complaint.description}
                </Text>

                {/* Meta Info */}
                <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-100">
                  <View className="flex-row items-center flex-1">
                    <MaterialIcons name="location-on" size={14} color="#6b7280" />
                    <Text className="text-gray-500 text-xs ml-1 flex-1" numberOfLines={1}>
                      {complaint.location || 'No location'}
                    </Text>
                  </View>
                  <Text className={`text-xs font-bold uppercase ml-2 ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority || 'medium'}
                  </Text>
                </View>

                {/* Admin Actions */}
                <View className="flex-row justify-between">
                  <TouchableOpacity
                    onPress={() => handleViewDetails(complaint)}
                    className="flex-1 bg-blue-600 rounded-xl py-2.5 mr-1.5 flex-row items-center justify-center"
                  >
                    <MaterialIcons name="visibility" size={16} color="white" />
                    <Text className="text-white font-semibold ml-1.5 text-sm">View</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleChangeStatus(complaint)}
                    className="flex-1 bg-green-600 rounded-xl py-2.5 mx-1.5 flex-row items-center justify-center"
                  >
                    <MaterialIcons name="edit" size={16} color="white" />
                    <Text className="text-white font-semibold ml-1.5 text-sm">Status</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeleteComplaint(complaint)}
                    className="flex-1 bg-red-500 rounded-xl py-2.5 ml-1.5 flex-row items-center justify-center"
                  >
                    <MaterialIcons name="delete" size={16} color="white" />
                    <Text className="text-white font-semibold ml-1.5 text-sm">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <View className="h-6" />
        </ScrollView>
      </View>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            <View className="flex-row items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
              <Text className="text-gray-900 text-2xl font-bold">Complaint Details</Text>
              <TouchableOpacity 
                onPress={() => setShowDetailModal(false)}
                className="w-10 h-10 rounded-full bg-white items-center justify-center"
              >
                <MaterialIcons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
              {selectedComplaint && (
                <>
                  <View className={`self-start px-4 py-2 rounded-full mb-4 ${getStatusColor(selectedComplaint.status)}`}>
                    <Text className="text-white font-bold">
                      {getStatusText(selectedComplaint.status)}
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-500 text-xs font-semibold mb-1.5 uppercase">Title</Text>
                    <Text className="text-gray-900 text-xl font-bold">{selectedComplaint.title}</Text>
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-500 text-xs font-semibold mb-1.5 uppercase">Description</Text>
                    <Text className="text-gray-700 text-base leading-6">{selectedComplaint.description}</Text>
                  </View>

                  <View className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200">
                    <View className="mb-3 pb-3 border-b border-gray-200">
                      <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase">Type</Text>
                      <Text className="text-gray-800 text-base font-medium capitalize">{selectedComplaint.type}</Text>
                    </View>

                    <View className="mb-3 pb-3 border-b border-gray-200">
                      <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase">Location</Text>
                      <Text className="text-gray-800 text-base">{selectedComplaint.location || 'Not specified'}</Text>
                    </View>

                    <View className="mb-3 pb-3 border-b border-gray-200">
                      <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase">Priority</Text>
                      <Text className={`text-base font-bold capitalize ${getPriorityColor(selectedComplaint.priority)}`}>
                        {selectedComplaint.priority || 'medium'}
                      </Text>
                    </View>

                    <View>
                      <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase">Submitted Date</Text>
                      <Text className="text-gray-800 text-base">{formatDate(selectedComplaint.createdAt)}</Text>
                    </View>
                  </View>

                  <View className="flex-row mt-4">
                    <TouchableOpacity
                      onPress={() => {
                        setShowDetailModal(false)
                        handleChangeStatus(selectedComplaint)
                      }}
                      className="flex-1 bg-blue-600 rounded-xl py-3.5 mr-2 flex-row items-center justify-center"
                    >
                      <MaterialIcons name="edit" size={20} color="white" />
                      <Text className="text-white font-bold ml-2">Change Status</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDeleteComplaint(selectedComplaint)}
                      className="flex-1 bg-red-500 rounded-xl py-3.5 ml-2 flex-row items-center justify-center"
                    >
                      <MaterialIcons name="delete" size={20} color="white" />
                      <Text className="text-white font-bold ml-2">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        visible={showStatusModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl w-full p-6">
            <Text className="text-gray-900 text-2xl font-bold mb-4">Change Status</Text>
            
            <Text className="text-gray-600 mb-4">
              Select new status for: <Text className="font-bold">{selectedComplaint?.title}</Text>
            </Text>

            <View className="space-y-2">
              {['pending', 'in-progress', 'resolved'].map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setNewStatus(status)}
                  className={`p-4 rounded-xl border-2 ${
                    newStatus === status 
                      ? 'bg-blue-50 border-blue-600' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`text-center font-bold capitalize ${
                    newStatus === status ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {getStatusText(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row mt-6">
              <TouchableOpacity
                onPress={handleUpdateStatus}
                className="flex-1 bg-blue-600 rounded-xl py-3 mr-2"
              >
                <Text className="text-white font-bold text-center">Update Status</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowStatusModal(false)}
                className="flex-1 bg-gray-200 rounded-xl py-3 ml-2"
              >
                <Text className="text-gray-700 font-bold text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default ManageComplaints