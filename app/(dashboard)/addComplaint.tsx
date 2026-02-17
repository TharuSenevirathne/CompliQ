import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, Platform, ActivityIndicator } from "react-native"
import React, { useState } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import * as MediaLibrary from "expo-media-library"
import DateTimePicker from '@react-native-community/datetimepicker'
import { submitComplaint } from "@/services/complaintService"
import { useAuth } from "@/hooks/useAuth"
import Toast from 'react-native-toast-message';
import { serverTimestamp } from "firebase/firestore";

const AddComplaint = () => {

  const { user} = useAuth() 
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [video, setVideo] = useState<string | null>(null)
  const [location, setLocation] = useState("")
  const [priority, setPriority] = useState("medium")
  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Predefined complaint types and priorities
  const complaintTypes = [
    { id: "road", label: "Road Issues", icon: "directions" },
    { id: "waste", label: "Waste Management", icon: "delete" },
    { id: "water", label: "Water Supply", icon: "water-drop" },
    { id: "electricity", label: "Electricity", icon: "electrical-services" },
    { id: "noise", label: "Noise Pollution", icon: "volume-up" },
    { id: "other", label: "Other", icon: "more-horiz" }
  ]

  // Priority levels with colors
  const priorities = [
    { id: "low", label: "Low", color: "bg-green-500" },
    { id: "medium", label: "Medium", color: "bg-yellow-500" },
    { id: "high", label: "High", color: "bg-red-500" }
  ]

  //  Helper to format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Handle date change from picker
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios')
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  // Permissions check helpers
const requestCameraPermission = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      "Camera Permission Required",
      "This app needs access to your camera to take photos.",
      [{ text: "OK", onPress: () => {} }]
    );
    return false;
  }
  return true;
};

const requestMediaLibraryPermission = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      "Gallery Access Required",
      "This app needs access to your photos and videos.",
      [{ text: "OK", onPress: () => {} }]
    );
    return false;
  }
  return true;
};

  // Helper function to convert uri to base64
const uriToBase64 = async (uri: string): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// PICK IMAGE FROM GALLERY ---
const pickImage = async () => {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) return;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    quality: 0.7,  
  });

  if (!result.canceled && result.assets) {
    const newUris = result.assets.map(asset => asset.uri);
    const total = [...images, ...newUris];

    if (total.length > 3) {
      Alert.alert("Image Limit", "Maximum 3 images allowed.");
      setImages(total.slice(0, 3));
    } else {
      setImages(total);
    }
  }
};

// TAKE PHOTO WITH CAMERA ---
const takePhoto = async () => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return;

  const result = await ImagePicker.launchCameraAsync({
    quality: 0.7,         
    allowsEditing: false,
  });

  if (!result.canceled && result.assets) {
    setImages([...images, result.assets[0].uri]);
  }
};

  // PICK VIDEO FROM GALLERY ---
 const pickVideo = async () => {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) return;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    quality: 1,
  });

  if (!result.canceled && result.assets) {
    setVideo(result.assets[0].uri);
  }
};

  // SAVE IMAGE TO DEVICE GALLERY ---
  const saveImageToGallery = async (imageUri: string) => {
    if (!imageUri) {
      Alert.alert("No Image", "No image to save.")
      return
    }
    
    const { status } = await MediaLibrary.requestPermissionsAsync()
    
    if (status === 'granted') {
      try {
        await MediaLibrary.createAssetAsync(imageUri)
        Alert.alert("Success", "Image saved to gallery!")
      } catch (error) {
        Alert.alert("Error", "Failed to save image to gallery.")
      }
    } else {
      Alert.alert("Permission Denied", "We need access to save photos.")
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  

  // SUBMIT COMPLAINT ---
  const handleSubmit = async () => {

    if (!user?.uid) {
    Alert.alert("Not logged in", "Please login again");
    return;
  }

  // Trim inputs and validate required fields
  if (!title.trim() || !description.trim() || !selectedType) {
    Alert.alert("Error", "Title, description and type are required");
    return;
  }
  setIsSubmitting(true);

  try {
    // Prepare complaint data
   const complaintData = {
  title: title.trim(),
  description: description.trim(),
  type: selectedType,
  location: location.trim() || null,
  priority,
  images,
  video,
  status: "pending",
  userId: user?.uid,
  createdAt: serverTimestamp(),
};

    console.log("Submitting complaint with data:", complaintData);
    const result = await submitComplaint(user.uid, complaintData);
    console.log(" Full result from submitComplaint:", result);

    if (result.success) {
    console.log("SUCCESS! Complaint saved with ID:", result.id);

    Toast.show({
      type: 'success',
      text1: 'Complaint saved successfully...',
      text2: `Complaint ID: ${result.id} • ${formatDate(new Date())}`,
      visibilityTime: 6000,     
      position: 'top',
      topOffset: 60,
    });    
    } else {
      console.log("Submission failed:", result.error);

      Toast.show({
        type: 'error',
        text1: 'Failed to save complaint',
        text2: result.error,
        visibilityTime: 6000,     
        position: 'top',
        topOffset: 60,
      });
    }
  } catch (err: any) {
    console.error(" Unexpected error in handleSubmit:", err);
    Alert.alert(
      "Unexpected Error",
      err.message || "An unexpected error occurred while submitting your complaint. Please try again."
    );
  } finally {
    setIsSubmitting(false);
  }

  // Reset form after submission
  setTitle("");
  setDescription("");
  setSelectedType("");
  setImages([]);
  setVideo(null);
  setLocation("");
  setPriority("medium");
  setDate(new Date());
};
  

  return (
    <View className="flex-1 bg-gray-50">
      {/* Decorative background */}
      <View className="absolute top-[-100] right-[-100] w-80 h-80 rounded-full bg-blue-50 opacity-30" />
      
      {/* Header */}
      <View className="bg-white pt-14 pb-6 px-6 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-900 text-3xl font-bold">New Complaint</Text>
            <Text className="text-blue-600 text-base mt-1 font-medium">Submit your concerns</Text>
          </View>
          <View className="w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center">
            <MaterialIcons name="add-circle" size={28} color="white" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-gray-700 font-semibold text-sm mb-2">Title *</Text>
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border-2 border-gray-200"
            placeholder="Enter complaint title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Date Picker */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-gray-700 font-semibold text-sm mb-2">Date of Incident *</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center justify-between border-2 border-gray-200"
          >
            <View className="flex-row items-center">
              <MaterialIcons name="calendar-today" size={20} color="#2563eb" />
              <Text className="text-gray-900 ml-3 font-medium">{formatDate(date)}</Text>
            </View>
            <MaterialIcons name="arrow-drop-down" size={24} color="#6b7280" />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Complaint Type */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-gray-700 font-semibold text-sm mb-3">Complaint Type *</Text>
          <View className="flex-row flex-wrap">
            {complaintTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setSelectedType(type.id)}
                className={`flex-row items-center px-4 py-2.5 rounded-xl mr-2 mb-2 border-2 ${
                  selectedType === type.id 
                    ? "bg-blue-600 border-blue-600" 
                    : "bg-white border-gray-200"
                }`}
              >
                <MaterialIcons 
                  name={type.icon as any} 
                  size={18} 
                  color={selectedType === type.id ? "white" : "#374151"} 
                />
                <Text className={`ml-2 font-medium ${
                  selectedType === type.id ? "text-white" : "text-gray-700"
                }`}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-gray-700 font-semibold text-sm mb-2">Description *</Text>
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border-2 border-gray-200"
            placeholder="Describe your complaint in detail..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Location */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-gray-700 font-semibold text-sm mb-2">Location (Optional)</Text>
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border-2 border-gray-200"
            placeholder="Enter location or address"
            value={location}
            onChangeText={setLocation}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Priority Level */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-gray-700 font-semibold text-sm mb-3">Priority Level</Text>
          <View className="flex-row justify-between">
            {priorities.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setPriority(p.id)}
                className={`flex-1 mx-1 py-3 rounded-xl shadow-sm ${
                  priority === p.id ? p.color : "bg-gray-100 border-2 border-gray-200"
                }`}
              >
                <Text className={`text-center font-bold ${
                  priority === p.id ? "text-white" : "text-gray-700"
                }`}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Media Upload */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-gray-700 font-semibold text-sm mb-3">Attach Media </Text>
          
          {/* Upload Buttons */}
          <View className="flex-row mb-4">
            <TouchableOpacity
              onPress={takePhoto}
              className="flex-1 bg-blue-600 rounded-xl py-3 mr-2 flex-row items-center justify-center shadow-md"
            >
              <MaterialIcons name="camera-alt" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Camera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={pickImage}
              className="flex-1 bg-blue-500 rounded-xl py-3 mx-1 flex-row items-center justify-center shadow-md"
            >
              <MaterialIcons name="photo-library" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickVideo}
              className="flex-1 bg-gray-700 rounded-xl py-3 ml-2 flex-row items-center justify-center shadow-md"
            >
              <MaterialIcons name="videocam" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Video</Text>
            </TouchableOpacity>
          </View>

          {/* Images Preview */}
          {images.length > 0 && (
            <View className="mb-3">
              <Text className="text-gray-700 font-semibold mb-2">Images ({images.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((uri, index) => (
                  <View key={index} className="mr-3 relative">
                    <Image source={{ uri }} className="w-24 h-24 rounded-xl border-2 border-gray-200" />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-md"
                    >
                      <MaterialIcons name="close" size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => saveImageToGallery(uri)}
                      className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1 shadow-md"
                    >
                      <MaterialIcons name="save" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Video Preview */}
          {video && (
            <View className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <MaterialIcons name="videocam" size={24} color="#2563eb" />
                <Text className="text-gray-700 font-medium ml-2 flex-1" numberOfLines={1}>
                  Video attached
                </Text>
              </View>
              <TouchableOpacity onPress={() => setVideo(null)}>
                <MaterialIcons name="close" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={() => {
    console.log("Submit button pressed!");
    handleSubmit();
  }}
  disabled={isSubmitting}
          className={`rounded-2xl py-4 mb-6 shadow-lg ${
            isSubmitting ? 'bg-blue-400' : 'bg-blue-600 active:bg-blue-700'
          }`}
        >
          {isSubmitting ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator color="white" />
              <Text className="text-white text-center font-bold text-lg ml-2">
                Submitting...
              </Text>
            </View>
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              Submit Complaint
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

export default AddComplaint