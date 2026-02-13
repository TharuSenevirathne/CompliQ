import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, Platform, ActivityIndicator } from "react-native"
import React, { useState } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import * as MediaLibrary from "expo-media-library"
import DateTimePicker from '@react-native-community/datetimepicker'
import { submitComplaint } from "@/services/complaintService"
import { useAuth } from "@/hooks/useAuth"

const AddComplaint = () => {

  const { user } = useAuth() // Get current user
  
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

  const complaintTypes = [
    { id: "road", label: "Road Issues", icon: "road" },
    { id: "waste", label: "Waste Management", icon: "delete" },
    { id: "water", label: "Water Supply", icon: "water-drop" },
    { id: "electricity", label: "Electricity", icon: "electrical-services" },
    { id: "noise", label: "Noise Pollution", icon: "volume-up" },
    { id: "other", label: "Other", icon: "more-horiz" }
  ]

  const priorities = [
    { id: "low", label: "Low", color: "bg-green-500" },
    { id: "medium", label: "Medium", color: "bg-yellow-500" },
    { id: "high", label: "High", color: "bg-red-500" }
  ]

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios')
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  //  TAKE PHOTO FROM CAMERA ---
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
      })
      
      if (!result.canceled && result.assets) {
        setImages([...images, result.assets[0].uri])
      }
    } else {
      Alert.alert("Permission Denied", "We need camera access to take photos.")
    }
  }

  //  PICK IMAGE FROM GALLERY ---
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    })

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri)
      const totalImages = [...images, ...newImages]
      
      // Limit to 3 images
      if (totalImages.length > 3) {
        Alert.alert(
          "Image Limit", 
          "You can only upload maximum 3 images. First 3 images will be selected."
        )
        setImages(totalImages.slice(0, 3))
      } else {
        setImages(totalImages)
      }
    }
  }

  // PICK VIDEO FROM GALLERY ---
  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    })

    if (!result.canceled && result.assets) {
      setVideo(result.assets[0].uri)
    }
  }

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

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title")
      return
    }
    if (!description.trim()) {
      Alert.alert("Error", "Please enter a description")
      return
    }
    if (!selectedType) {
      Alert.alert("Error", "Please select a complaint type")
      return
    }
    if (!user) {
      Alert.alert("Error", "You must be logged in to submit a complaint")
      return
    }

    setIsSubmitting(true)

    try {
      const complaintData = {
        title,
        description,
        type: selectedType,
        location,
        priority,
        date,
        images,
        video
      }

      const result = await submitComplaint(user.uid, complaintData)

      if (result.success) {
        Alert.alert("Success", "Complaint submitted successfully!", [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              setTitle("")
              setDescription("")
              setSelectedType("")
              setImages([])
              setVideo(null)
              setLocation("")
              setPriority("medium")
              setDate(new Date())
            }
          }
        ])
      } else {
        Alert.alert("Error", "Failed to submit complaint. Please try again.")
      }
    } catch (error) {
      console.error("Submit error:", error)
      Alert.alert("Error", "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <Text className="text-gray-700 font-semibold text-sm mb-3">Attach Media (Optional)</Text>
          
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
          onPress={handleSubmit}
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