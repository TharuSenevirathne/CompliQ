import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, Modal } from "react-native"
import React, { useState } from "react"
import { MaterialIcons } from "@expo/vector-icons"

// Mock data - replace with real data from your backend
const mockComplaints = [
  {
    id: "1",
    title: "Street Light Issue",
    description: "The street light near my house has been broken for 2 weeks. It's very dark at night and unsafe for pedestrians.",
    type: "electricity",
    status: "pending",
    priority: "high",
    location: "Main Street, Colombo 03",
    date: "2024-02-08",
    images: ["https://via.placeholder.com/400", "https://via.placeholder.com/400/0000FF"],
    video: "video_uri_here"
  },
  {
    id: "2",
    title: "Garbage Collection Delay",
    description: "Garbage has not been collected for the past 5 days in our area. This is causing health issues.",
    type: "waste",
    status: "in-progress",
    priority: "medium",
    location: "Park Road, Colombo 05",
    date: "2024-02-07",
    images: ["https://via.placeholder.com/400/FF0000"],
    video: null
  },
  {
    id: "3",
    title: "Road Damage",
    description: "Large potholes on the main road causing accidents. Needs urgent repair.",
    type: "road",
    status: "resolved",
    priority: "high",
    location: "Galle Road, Colombo 06",
    date: "2024-02-06",
    images: [],
    video: null
  },
]

const ComplaintBox = () => {
  const [complaints, setComplaints] = useState(mockComplaints)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")

  // Edit form states
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editLocation, setEditLocation] = useState("")
  const [editPriority, setEditPriority] = useState("")

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

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "road": return "road"
      case "waste": return "delete"
      case "water": return "water-drop"
      case "electricity": return "electrical-services"
      case "noise": return "volume-up"
      default: return "more-horiz"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "low": return "text-green-500"
      case "medium": return "text-yellow-500"
      case "high": return "text-red-500"
      default: return "text-gray-500"
    }
  }

  // Filter and search complaints
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterStatus === "all" || complaint.status === filterStatus

    return matchesSearch && matchesFilter
  })

  // View complaint details
  const handleViewDetails = (complaint: any) => {
    setSelectedComplaint(complaint)
    setShowDetailModal(true)
  }

  // Delete complaint - FIXED
  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Complaint",
      "Are you sure you want to delete this complaint?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setComplaints(prevComplaints => prevComplaints.filter(c => c.id !== id))
            setShowDetailModal(false)
            Alert.alert("Success", "Complaint deleted successfully!")
          }
        }
      ]
    )
  }

  // Open edit modal
  const handleOpenEdit = (complaint: any) => {
    setSelectedComplaint(complaint)
    setEditTitle(complaint.title)
    setEditDescription(complaint.description)
    setEditLocation(complaint.location)
    setEditPriority(complaint.priority)
    setShowDetailModal(false)
    setShowEditModal(true)
  }

  // Save edited complaint
  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editDescription.trim()) {
      Alert.alert("Error", "Please fill all required fields")
      return
    }

    const updatedComplaints = complaints.map(c => 
      c.id === selectedComplaint.id 
        ? { ...c, title: editTitle, description: editDescription, location: editLocation, priority: editPriority }
        : c
    )

    setComplaints(updatedComplaints)
    setShowEditModal(false)
    Alert.alert("Success", "Complaint updated successfully!")
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-black pt-12 pb-6 px-6">
        <Text className="text-white text-3xl font-bold">Complaint Box</Text>
        <Text className="text-gray-400 text-base mt-1">{complaints.length} Total Complaints</Text>
      </View>

      <View className="flex-1 px-6">
        {/* Search Bar */}
        <View className="bg-white rounded-2xl p-3 mt-4 flex-row items-center">
          <MaterialIcons name="search" size={24} color="#9ca3af" />
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

        {/* Filter Buttons - NEW DESIGN */}
        <View className="bg-white rounded-2xl p-2 mt-4 flex-row">
          <TouchableOpacity
            onPress={() => setFilterStatus("all")}
            className={`flex-1 py-3 rounded-xl items-center ${
              filterStatus === "all" ? "bg-black" : "bg-transparent"
            }`}
          >
            <Text className={`font-semibold ${
              filterStatus === "all" ? "text-white" : "text-gray-600"
            }`}>
              All
            </Text>
            <Text className={`text-xs mt-1 ${
              filterStatus === "all" ? "text-gray-300" : "text-gray-400"
            }`}>
              {complaints.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterStatus("pending")}
            className={`flex-1 py-3 rounded-xl items-center ${
              filterStatus === "pending" ? "bg-yellow-500" : "bg-transparent"
            }`}
          >
            <Text className={`font-semibold ${
              filterStatus === "pending" ? "text-white" : "text-gray-600"
            }`}>
              Pending
            </Text>
            <Text className={`text-xs mt-1 ${
              filterStatus === "pending" ? "text-yellow-100" : "text-gray-400"
            }`}>
              {complaints.filter(c => c.status === "pending").length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterStatus("in-progress")}
            className={`flex-1 py-3 rounded-xl items-center ${
              filterStatus === "in-progress" ? "bg-blue-500" : "bg-transparent"
            }`}
          >
            <Text className={`font-semibold ${
              filterStatus === "in-progress" ? "text-white" : "text-gray-600"
            }`}>
              Active
            </Text>
            <Text className={`text-xs mt-1 ${
              filterStatus === "in-progress" ? "text-blue-100" : "text-gray-400"
            }`}>
              {complaints.filter(c => c.status === "in-progress").length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterStatus("resolved")}
            className={`flex-1 py-3 rounded-xl items-center ${
              filterStatus === "resolved" ? "bg-green-500" : "bg-transparent"
            }`}
          >
            <Text className={`font-semibold ${
              filterStatus === "resolved" ? "text-white" : "text-gray-600"
            }`}>
              Resolved
            </Text>
            <Text className={`text-xs mt-1 ${
              filterStatus === "resolved" ? "text-green-100" : "text-gray-400"
            }`}>
              {complaints.filter(c => c.status === "resolved").length}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Complaints List */}
        <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
          {filteredComplaints.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center justify-center mt-8">
              <MaterialIcons name="inbox" size={64} color="#d1d5db" />
              <Text className="text-gray-500 text-lg mt-4">No complaints found</Text>
              <Text className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</Text>
            </View>
          ) : (
            filteredComplaints.map((complaint) => (
              <View key={complaint.id} className="bg-white rounded-2xl p-4 mb-3">
                {/* Header Row */}
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <MaterialIcons name={getTypeIcon(complaint.type) as any} size={18} color="#374151" />
                      <Text className="text-gray-800 font-bold text-lg ml-2 flex-1">{complaint.title}</Text>
                    </View>
                    <Text className="text-gray-500 text-xs">{complaint.date}</Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${getStatusColor(complaint.status)}`}>
                    <Text className="text-white text-xs font-medium">
                      {getStatusText(complaint.status)}
                    </Text>
                  </View>
                </View>

                {/* Description Preview */}
                <Text className="text-gray-600 text-sm mb-3" numberOfLines={2}>
                  {complaint.description}
                </Text>

                {/* Images Preview - NEW */}
                {complaint.images && complaint.images.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                    {complaint.images.map((img, index) => (
                      <Image 
                        key={index}
                        source={{ uri: img }} 
                        className="w-20 h-20 rounded-lg mr-2"
                      />
                    ))}
                  </ScrollView>
                )}

                {/* Video Indicator - NEW */}
                {complaint.video && (
                  <View className="bg-gray-100 rounded-lg p-2 flex-row items-center mb-3">
                    <MaterialIcons name="videocam" size={20} color="#374151" />
                    <Text className="text-gray-700 text-xs ml-2">Video attached</Text>
                  </View>
                )}

                {/* Location and Priority */}
                <View className="flex-row items-center mb-3">
                  <MaterialIcons name="location-on" size={14} color="#9ca3af" />
                  <Text className="text-gray-500 text-xs ml-1 flex-1">{complaint.location}</Text>
                  <Text className={`text-xs font-semibold ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority.toUpperCase()} Priority
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row justify-between pt-3 border-t border-gray-100">
                  <TouchableOpacity
                    onPress={() => handleViewDetails(complaint)}
                    className="flex-1 bg-black rounded-xl py-2 mr-2 flex-row items-center justify-center"
                  >
                    <MaterialIcons name="visibility" size={18} color="white" />
                    <Text className="text-white font-medium ml-2">View</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleOpenEdit(complaint)}
                    className="flex-1 bg-blue-600 rounded-xl py-2 mx-1 flex-row items-center justify-center"
                  >
                    <MaterialIcons name="edit" size={18} color="white" />
                    <Text className="text-white font-medium ml-2">Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDelete(complaint.id)}
                    className="flex-1 bg-red-500 rounded-xl py-2 ml-2 flex-row items-center justify-center"
                  >
                    <MaterialIcons name="delete" size={18} color="white" />
                    <Text className="text-white font-medium ml-2">Delete</Text>
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
          <View className="bg-white rounded-t-3xl max-h-[85%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
              <Text className="text-black text-2xl font-bold">Complaint Details</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <MaterialIcons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-6">
              {selectedComplaint && (
                <>
                  {/* Status Badge */}
                  <View className={`self-start px-4 py-2 rounded-full mb-4 ${getStatusColor(selectedComplaint.status)}`}>
                    <Text className="text-white font-semibold">
                      {getStatusText(selectedComplaint.status)}
                    </Text>
                  </View>

                  {/* Title */}
                  <View className="mb-4">
                    <Text className="text-gray-500 text-sm mb-1">Title</Text>
                    <Text className="text-black text-xl font-bold">{selectedComplaint.title}</Text>
                  </View>

                  {/* Description */}
                  <View className="mb-4">
                    <Text className="text-gray-500 text-sm mb-1">Description</Text>
                    <Text className="text-gray-800 text-base leading-6">{selectedComplaint.description}</Text>
                  </View>

                  {/* Images - NEW */}
                  {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                    <View className="mb-4">
                      <Text className="text-gray-500 text-sm mb-2">Images ({selectedComplaint.images.length})</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {selectedComplaint.images.map((img: string, index: number) => (
                          <Image 
                            key={index}
                            source={{ uri: img }} 
                            className="w-32 h-32 rounded-xl mr-3"
                          />
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Video - NEW */}
                  {selectedComplaint.video && (
                    <View className="mb-4">
                      <Text className="text-gray-500 text-sm mb-2">Video</Text>
                      <View className="bg-gray-100 rounded-xl p-4 flex-row items-center">
                        <MaterialIcons name="videocam" size={32} color="#374151" />
                        <Text className="text-gray-700 ml-3 flex-1">Video file attached</Text>
                        <TouchableOpacity className="bg-black px-4 py-2 rounded-lg">
                          <Text className="text-white text-sm font-medium">Play</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Type */}
                  <View className="mb-4">
                    <Text className="text-gray-500 text-sm mb-1">Type</Text>
                    <View className="flex-row items-center">
                      <MaterialIcons name={getTypeIcon(selectedComplaint.type) as any} size={20} color="#374151" />
                      <Text className="text-gray-800 text-base ml-2 capitalize">{selectedComplaint.type}</Text>
                    </View>
                  </View>

                  {/* Location */}
                  <View className="mb-4">
                    <Text className="text-gray-500 text-sm mb-1">Location</Text>
                    <View className="flex-row items-center">
                      <MaterialIcons name="location-on" size={20} color="#374151" />
                      <Text className="text-gray-800 text-base ml-2">{selectedComplaint.location}</Text>
                    </View>
                  </View>

                  {/* Priority */}
                  <View className="mb-4">
                    <Text className="text-gray-500 text-sm mb-1">Priority</Text>
                    <Text className={`text-base font-semibold capitalize ${getPriorityColor(selectedComplaint.priority)}`}>
                      {selectedComplaint.priority}
                    </Text>
                  </View>

                  {/* Date */}
                  <View className="mb-4">
                    <Text className="text-gray-500 text-sm mb-1">Submitted Date</Text>
                    <View className="flex-row items-center">
                      <MaterialIcons name="calendar-today" size={20} color="#374151" />
                      <Text className="text-gray-800 text-base ml-2">{selectedComplaint.date}</Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row mt-6">
                    <TouchableOpacity
                      onPress={() => handleOpenEdit(selectedComplaint)}
                      className="flex-1 bg-blue-600 rounded-xl py-3 mr-2 flex-row items-center justify-center"
                    >
                      <MaterialIcons name="edit" size={20} color="white" />
                      <Text className="text-white font-semibold ml-2">Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDelete(selectedComplaint.id)}
                      className="flex-1 bg-red-500 rounded-xl py-3 ml-2 flex-row items-center justify-center"
                    >
                      <MaterialIcons name="delete" size={20} color="white" />
                      <Text className="text-white font-semibold ml-2">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[85%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
              <Text className="text-black text-2xl font-bold">Edit Complaint</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <MaterialIcons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-6">
              {/* Title Input */}
              <View className="mb-4">
                <Text className="text-black font-semibold mb-2">Title *</Text>
                <TextInput
                  className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800"
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Enter title"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Description Input */}
              <View className="mb-4">
                <Text className="text-black font-semibold mb-2">Description *</Text>
                <TextInput
                  className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800"
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Enter description"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Location Input */}
              <View className="mb-4">
                <Text className="text-black font-semibold mb-2">Location</Text>
                <TextInput
                  className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800"
                  value={editLocation}
                  onChangeText={setEditLocation}
                  placeholder="Enter location"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Priority Selection */}
              <View className="mb-4">
                <Text className="text-black font-semibold mb-2">Priority</Text>
                <View className="flex-row justify-between">
                  {["low", "medium", "high"].map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setEditPriority(p)}
                      className={`flex-1 mx-1 py-3 rounded-xl ${
                        editPriority === p 
                          ? p === "low" ? "bg-green-500" 
                            : p === "medium" ? "bg-yellow-500" 
                            : "bg-red-500"
                          : "bg-gray-100"
                      }`}
                    >
                      <Text className={`text-center font-semibold capitalize ${
                        editPriority === p ? "text-white" : "text-gray-700"
                      }`}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSaveEdit}
                className="bg-black rounded-xl py-4 mt-4"
              >
                <Text className="text-white text-center font-bold text-lg">Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default ComplaintBox