import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { Alert,Image,Modal,ScrollView,Text,TextInput,TouchableOpacity,View,} from "react-native";
import { collection,onSnapshot,query,orderBy,deleteDoc,doc,updateDoc,Timestamp, } from "firebase/firestore";
import { db } from "@/services/firebase";
import { useAuth } from "@/hooks/useAuth";
import Toast from 'react-native-toast-message';

// Complaint type
interface Complaint {
  id: string;
  title: string;
  description: string;
  type: string;
  status: "pending" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  location?: string;
  createdAt?: any;          
  images?: string[];
  video?: string | null;
  userId?: string;
  [key: string]: any;
}

const ComplaintBox = () => {

  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "in-progress" | "resolved">("all");

  // Edit form states
  const [editTitle, setEditTitle] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editLocation, setEditLocation] = useState<string>("");
  const [editPriority, setEditPriority] = useState<"low" | "medium" | "high">("medium");

  // Firebase real-time load
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      Alert.alert("Login Required", "Please login to view your complaints");
      return;
    }

    // Query for user's complaints ordered by createdAt descending
    const q = query(
      collection(db, "complaints"),
      orderBy("createdAt", "desc")
    );

    // Real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: Complaint[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        let createdAtDate: Date | undefined;

        if (data.createdAt instanceof Timestamp) {
          createdAtDate = data.createdAt.toDate();
        } else if (data.createdAt instanceof Date) {
          createdAtDate = data.createdAt;
        } else if (typeof data.createdAt === "string") {
          const parsed = new Date(data.createdAt);
          createdAtDate = isNaN(parsed.getTime()) ? undefined : parsed;
        }

        if (!createdAtDate && typeof data.date === "string") {
          const parsed = new Date(data.date);
          createdAtDate = isNaN(parsed.getTime()) ? undefined : parsed;
        }

        // Ensure we only load complaints that belong to the current user
        return {
          id: doc.id,
          title: (data.title as string) || "",
          description: (data.description as string) || "",
          type: (data.type as string) || "other",
          status: (data.status as "pending" | "in-progress" | "resolved") || "pending",
          priority: (data.priority as "low" | "medium" | "high") || "medium",
          location: (data.location as string) || "",
          createdAt: createdAtDate,
          images: (data.images as string[]) || [],
          video: (data.video as string | null) || null,
          userId: data.userId as string | undefined,
          ...data,
        };

        });

        setComplaints(loaded);
        setLoading(false);
      },
      (error) => {
        console.error("Firebase error:", error);
        Alert.alert("Error", "Failed to load complaints");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Helper functions for UI
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "in-progress": return "bg-blue-500";
      case "resolved": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "pending": return "Pending";
      case "in-progress": return "In Progress";
      case "resolved": return "Resolved";
      default: return status;
    }
  };

  const getTypeIcon = (type: string): keyof typeof MaterialIcons.glyphMap => {
    switch (type) {
      case "road": return "directions";
      case "waste": return "delete";
      case "water": return "water-drop";
      case "electricity": return "electrical-services";
      case "noise": return "volume-up";
      default: return "more-horiz";
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "low": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "high": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  // Filtering logic
  const filteredComplaints = complaints.filter((complaint: Complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (complaint.location || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === "all" || complaint.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Handlers
  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  // Delete handler with confirmation using Toast
  const handleDelete = (id: string) => {
    console.log("Delete button pressed for ID:", id);

    Toast.show({
      type: 'info',
      text1: 'Confirm Delete',
      text2: 'Tap again to delete this complaint',
      visibilityTime: 4000,
      position: 'top',
      topOffset: 60,
      onPress: () => {
        // User tapped the toast → proceed with delete
        console.log("User confirmed delete via toast for ID:", id);

        deleteDoc(doc(db, "complaints", id))
          .then(() => {
            console.log("Delete SUCCESS for ID:", id);
            Toast.show({
              type: 'success',
              text1: 'Deleted Successfully',
              text2: 'Complaint removed',
              visibilityTime: 4000,
              position: 'top',
              topOffset: 60,
            });
            setShowDetailModal(false);
          })
          .catch((error) => {
            console.error("DELETE FAILED:", error.code, error.message);
            Toast.show({
              type: 'error',
              text1: 'Delete Failed',
              text2: error.message || 'Check permissions or network',
              visibilityTime: 6000,
              position: 'top',
              topOffset: 60,
            });
          });
      },
    });
  };

  // Edit handler
  const handleOpenEdit = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setEditTitle(complaint.title);
    setEditDescription(complaint.description);
    setEditLocation(complaint.location || "");
    setEditPriority(complaint.priority);
    setShowDetailModal(false);
    setShowEditModal(true);
  };

  // Save edit handler
  const handleSaveEdit = async () => {
  if (!editTitle.trim() || !editDescription.trim()) {
    Alert.alert("Error", "Title and description are required");
    return;
  }

  // Ensure we have a selected complaint with an ID
  if (!selectedComplaint?.id) return;

  try {
    // Update the complaint in Firestore
    const complaintRef = doc(db, "complaints", selectedComplaint.id);
    await updateDoc(complaintRef, {
      title: editTitle,
      description: editDescription,
      location: editLocation,
      priority: editPriority,
      updatedAt: new Date(),  
    });

    Toast.show({
      type: 'success',
      text1: 'Updated Successfully',
      text2: 'Complaint has been saved',
      visibilityTime: 4000,
      position: 'top',
      topOffset: 60,
    });

    setShowEditModal(false);
  } catch (error: any) {
    console.error("Update failed:", error);

    Toast.show({
      type: 'error',
      text1: 'Update Failed',
      text2: error.message || 'Something went wrong',
      visibilityTime: 5000,
      position: 'top',
      topOffset: 60,
    });
  }
};

  return (
    <View className="flex-1 bg-gray-50">
      {/* Decorative background */}
      <View className="absolute top-[-100] right-[-100] w-80 h-80 rounded-full bg-blue-50 opacity-30" />

      {/* Header */}
      <View className="bg-white pt-14 pb-6 px-6 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-900 text-3xl font-bold">Complaints</Text>
            <Text className="text-blue-600 text-base mt-1 font-medium">
              {complaints.length} Total Complaints
            </Text>
          </View>
          <View className="w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center">
            <MaterialIcons name="inbox" size={28} color="white" />
          </View>
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
                filterStatus === "all" ? "bg-blue-600" : "bg-white border-2 border-gray-200"
              }`}
            >
              <Text
                className={`text-center font-bold text-xs ${
                  filterStatus === "all" ? "text-white" : "text-gray-600"
                }`}
              >
                All
              </Text>
              <Text
                className={`text-center text-xs mt-1 ${
                  filterStatus === "all" ? "text-blue-100" : "text-gray-400"
                }`}
              >
                {complaints.length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilterStatus("pending")}
              className={`flex-1 py-3 rounded-xl mx-1 ${
                filterStatus === "pending" ? "bg-yellow-400" : "bg-white border-2 border-gray-200"
              }`}
            >
              <Text
                className={`text-center font-bold text-xs ${
                  filterStatus === "pending" ? "text-white" : "text-gray-600"
                }`}
              >
                Pending
              </Text>
              <Text
                className={`text-center text-xs mt-1 ${
                  filterStatus === "pending" ? "text-yellow-100" : "text-gray-400"
                }`}
              >
                {complaints.filter((c) => c.status === "pending").length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilterStatus("resolved")}
              className={`flex-1 py-3 rounded-xl ml-2 ${
                filterStatus === "resolved" ? "bg-green-500" : "bg-white border-2 border-gray-200"
              }`}
            >
              <Text
                className={`text-center font-bold text-xs ${
                  filterStatus === "resolved" ? "text-white" : "text-gray-600"
                }`}
              >
                Resolved
              </Text>
              <Text
                className={`text-center text-xs mt-1 ${
                  filterStatus === "resolved" ? "text-green-100" : "text-gray-400"
                }`}
              >
                {complaints.filter((c) => c.status === "resolved").length}
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
              <Text className="text-gray-900 text-lg font-bold">
                No complaints found
              </Text>
              <Text className="text-gray-500 text-sm mt-2">
                Try adjusting your search or filter
              </Text>
            </View>
          ) : (
            filteredComplaints.map((complaint) => (
              <View
                key={complaint.id}
                className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-gray-100"
              >
                {/* Header Row */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center mb-1">
                      <View className="w-8 h-8 rounded-lg bg-blue-50 items-center justify-center mr-2">
                        <MaterialIcons
                          name={getTypeIcon(complaint.type)}
                          size={18}
                          color="#2563eb"
                        />
                      </View>
                      <Text
                        className="text-gray-900 font-bold text-base flex-1"
                        numberOfLines={1}
                      >
                        {complaint.title}
                      </Text>
                    </View>
                  </View>
                  <View
                    className={`px-3 py-1.5 rounded-full ${getStatusColor(complaint.status)}`}
                  >
                    <Text className="text-white text-xs font-bold">
                      {getStatusText(complaint.status)}
                    </Text>
                  </View>
                </View>

                {/* Description Preview */}
                <Text
                  className="text-gray-600 text-sm mb-3 leading-5"
                  numberOfLines={2}
                >
                  {complaint.description}
                </Text>

                {/* Images Preview */}
                {Array.isArray(complaint.images) && complaint.images.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-3"
                  >
                    {complaint.images.map((img, index) => (
                      <Image
                  key={index}
                  source={{ uri: img }}   // img දැන් base64 string එකක් ("data:image/jpeg;base64,...")
                  className="w-20 h-20 rounded-xl mr-2 border-2 border-gray-100"
                />
                    ))}
                  </ScrollView>
                )}

                {/* Video Indicator */}
                {complaint.video && (
                  <View className="bg-blue-50 border border-blue-200 rounded-xl p-2 flex-row items-center mb-3">
                    <MaterialIcons name="videocam" size={18} color="#2563eb" />
                    <Text className="text-blue-700 text-xs ml-2 font-medium">
                      Video attached
                    </Text>
                  </View>
                )}

                {/* Location and Priority */}
                <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-100">
                  <View className="flex-row items-center flex-1 mr-2">
                    <MaterialIcons
                      name="location-on"
                      size={14}
                      color="#6b7280"
                    />
                    <Text
                      className="text-gray-500 text-xs ml-1 flex-1"
                      numberOfLines={1}
                    >
                      {complaint.location}
                    </Text>
                  </View>
                  <Text
                    className={`text-xs font-bold uppercase ${getPriorityColor(complaint.priority)}`}
                  >
                    {complaint.priority}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row justify-between">
                  <TouchableOpacity
                    onPress={() => handleViewDetails(complaint)}
                    className="flex-1 bg-gray-600 rounded-xl py-2.5 mr-1.5 flex-row items-center justify-center"
                  >
                    <MaterialIcons name="visibility" size={16} color="white" />
                    <Text className="text-white font-semibold ml-1.5 text-sm">
                      View
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleOpenEdit(complaint)}
                    className="flex-1 bg-green-500 rounded-xl py-2.5 mx-1.5 flex-row items-center justify-center"
                  >
                    <MaterialIcons name="edit" size={16} color="white" />
                    <Text className="text-white font-semibold ml-1.5 text-sm">
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDelete(complaint.id)}
                    className="flex-1 bg-red-500 rounded-xl py-2.5 ml-1.5 flex-row items-center justify-center"
                  >
                    <MaterialIcons name="delete" size={16} color="white" />
                    <Text className="text-white font-semibold ml-1.5 text-sm">
                      Delete
                    </Text>
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
              <Text className="text-gray-900 text-2xl font-bold">Details</Text>
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
                  <View
                    className={`self-start px-4 py-2 rounded-full mb-4 ${getStatusColor(selectedComplaint.status)}`}
                  >
                    <Text className="text-white font-bold">
                      {getStatusText(selectedComplaint.status)}
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-500 text-xs font-semibold mb-1.5 uppercase">
                      Title
                    </Text>
                    <Text className="text-gray-900 text-xl font-bold">
                      {selectedComplaint.title}
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-500 text-xs font-semibold mb-1.5 uppercase">
                      Description
                    </Text>
                    <Text className="text-gray-700 text-base leading-6">
                      {selectedComplaint.description}
                    </Text>
                  </View>

                  {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                    <View className="mb-4">
                      <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase">
                        Images ({selectedComplaint.images.length})
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {selectedComplaint.images.map((img: string, index: number) => (
                          <Image
                            key={index}
                            source={{ uri: img }}
                            className="w-40 h-40 rounded-xl mr-3 border-2 border-gray-200"
                          />
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {selectedComplaint.video && (
                    <View className="mb-4">
                      <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase">
                        Video
                      </Text>
                      <View className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex-row items-center">
                        <View className="w-12 h-12 rounded-xl bg-blue-600 items-center justify-center">
                          <MaterialIcons
                            name="videocam"
                            size={28}
                            color="white"
                          />
                        </View>
                        <Text className="text-gray-700 font-medium ml-3 flex-1">
                          Video file attached
                        </Text>
                        <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg">
                          <Text className="text-white text-sm font-semibold">
                            Play
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <View className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200">
                    <View className="mb-3 pb-3 border-b border-gray-200">
                      <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase">
                        Type
                      </Text>
                      <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-lg bg-blue-100 items-center justify-center mr-2">
                          <MaterialIcons
                            name={getTypeIcon(selectedComplaint.type)}
                            size={18}
                            color="#2563eb"
                          />
                        </View>
                        <Text className="text-gray-800 text-base font-medium capitalize">
                          {selectedComplaint.type}
                        </Text>
                      </View>
                    </View>

                    <View className="mb-3 pb-3 border-b border-gray-200">
                      <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase">
                        Location
                      </Text>
                      <View className="flex-row items-center">
                        <MaterialIcons name="location-on" size={20} color="#6b7280" />
                        <Text className="text-gray-800 text-base ml-2 flex-1">
                          {selectedComplaint.location}
                        </Text>
                      </View>
                    </View>

                    <View className="mb-3 pb-3 border-b border-gray-200">
                      <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase">
                        Priority
                      </Text>
                      <Text
                        className={`text-base font-bold capitalize ${getPriorityColor(selectedComplaint.priority)}`}
                      >
                        {selectedComplaint.priority}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row mt-4">
                    <TouchableOpacity
                      onPress={() => handleOpenEdit(selectedComplaint)}
                      className="flex-1 bg-blue-600 rounded-xl py-3.5 mr-2 flex-row items-center justify-center"
                    >
                      <MaterialIcons name="edit" size={20} color="white" />
                      <Text className="text-white font-bold ml-2">Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDelete(selectedComplaint.id)}
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

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            <View className="flex-row items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
              <Text className="text-gray-900 text-2xl font-bold">
                Edit Complaint
              </Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                className="w-10 h-10 rounded-full bg-white items-center justify-center"
              >
                <MaterialIcons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold text-sm mb-2">
                  Title *
                </Text>
                <TextInput
                  className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Enter title"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 font-semibold text-sm mb-2">
                  Description *
                </Text>
                <TextInput
                  className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Enter description"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 font-semibold text-sm mb-2">
                  Location
                </Text>
                <TextInput
                  className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  value={editLocation}
                  onChangeText={setEditLocation}
                  placeholder="Enter location"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View className="mb-6">
                <Text className="text-gray-700 font-semibold text-sm mb-2">
                  Priority
                </Text>
                <View className="flex-row justify-between">
                  {["low", "medium", "high"].map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setEditPriority(p as "low" | "medium" | "high")}
                      className={`flex-1 mx-1 py-3 rounded-xl shadow-sm ${
                        editPriority === p
                          ? p === "low"
                            ? "bg-green-500"
                            : p === "medium"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          : "bg-gray-100 border-2 border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-center font-bold capitalize ${
                          editPriority === p ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSaveEdit}
                className="bg-blue-600 rounded-xl py-4 mt-2"
              >
                <Text className="text-white text-center font-bold text-lg">
                  Save Changes
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ComplaintBox;