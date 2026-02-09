import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from "react-native"
import React, { useState } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import * as MediaLibrary from "expo-media-library"

const AddComplaint = () => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [video, setVideo] = useState<string | null>(null)
  const [location, setLocation] = useState("")
  const [priority, setPriority] = useState("medium")

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

  //  TAKE PHOTO FROM CAMERA ---
  const takePhoto = async () => {
    //  Ask for Camera Permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    
    if (status === 'granted') {
      // Open Camera
      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
      })
      
      //  Save temporary path to state
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
      setImages([...images, ...newImages])
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
    
    //  Ask for Gallery Permission
    const { status } = await MediaLibrary.requestPermissionsAsync()
    
    if (status === 'granted') {
      try {
        // Create Asset (Moves file from Cache -> Gallery)
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

    // Save all images to gallery before submitting
    if (images.length > 0) {
      const { status } = await MediaLibrary.requestPermissionsAsync()
      
      if (status === 'granted') {
        for (const imageUri of images) {
          await MediaLibrary.createAssetAsync(imageUri)
        }
      }
    }

    Alert.alert("Success", "Complaint submitted successfully!")
    
    // Reset form
    setTitle("")
    setDescription("")
    setSelectedType("")
    setImages([])
    setVideo(null)
    setLocation("")
    setPriority("medium")
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-black pt-12 pb-6 px-6">
        <Text className="text-white text-3xl font-bold">ADD COMPLAINT🤵🏻</Text>
        <Text className="text-gray-400 text-base mt-1">Submit your concerns</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Title Input */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-black font-semibold text-base mb-2">Title *</Text>
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800"
            placeholder="Enter complaint title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Complaint Type */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-black font-semibold text-base mb-3">Complaint Type *</Text>
          <View className="flex-row flex-wrap">
            {complaintTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setSelectedType(type.id)}
                className={`flex-row items-center px-4 py-2 rounded-full mr-2 mb-2 ${
                  selectedType === type.id ? "bg-black" : "bg-gray-100"
                }`}
              >
                <MaterialIcons 
                  name={type.icon as any} 
                  size={18} 
                  color={selectedType === type.id ? "white" : "#374151"} 
                />
                <Text className={`ml-2 ${selectedType === type.id ? "text-white" : "text-gray-700"}`}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-black font-semibold text-base mb-2">Description *</Text>
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800"
            placeholder="Describe your complaint in detail..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Location (Optional) */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-black font-semibold text-base mb-2">Location (Optional)</Text>
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800"
            placeholder="Enter location or address"
            value={location}
            onChangeText={setLocation}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Priority Level */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-black font-semibold text-base mb-3">Priority Level</Text>
          <View className="flex-row justify-between">
            {priorities.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setPriority(p.id)}
                className={`flex-1 mx-1 py-3 rounded-xl ${
                  priority === p.id ? p.color : "bg-gray-100"
                }`}
              >
                <Text className={`text-center font-semibold ${
                  priority === p.id ? "text-white" : "text-gray-700"
                }`}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Media Upload */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-black font-semibold text-base mb-3">Attach Media (Optional)</Text>
          
          {/* Upload Buttons */}
          <View className="flex-row mb-4">
            <TouchableOpacity
              onPress={takePhoto}
              className="flex-1 bg-black rounded-xl py-3 mr-2 flex-row items-center justify-center"
            >
              <MaterialIcons name="camera-alt" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Camera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={pickImage}
              className="flex-1 bg-blue-600 rounded-xl py-3 mx-1 flex-row items-center justify-center"
            >
              <MaterialIcons name="photo-library" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickVideo}
              className="flex-1 bg-gray-800 rounded-xl py-3 ml-2 flex-row items-center justify-center"
            >
              <MaterialIcons name="videocam" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Video</Text>
            </TouchableOpacity>
          </View>

          {/* Images Preview */}
          {images.length > 0 && (
            <View className="mb-3">
              <Text className="text-gray-700 font-medium mb-2">Images ({images.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((uri, index) => (
                  <View key={index} className="mr-3 relative">
                    <Image source={{ uri }} className="w-24 h-24 rounded-xl" />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    >
                      <MaterialIcons name="close" size={16} color="white" />
                    </TouchableOpacity>
                    {/* Save to Gallery Button */}
                    <TouchableOpacity
                      onPress={() => saveImageToGallery(uri)}
                      className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1"
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
            <View className="bg-gray-100 rounded-xl p-3 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <MaterialIcons name="videocam" size={24} color="#374151" />
                <Text className="text-gray-700 ml-2 flex-1" numberOfLines={1}>Video attached</Text>
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
          className="bg-black rounded-2xl py-4 mb-6 shadow-lg"
        >
          <Text className="text-white text-center font-bold text-lg">Submit Complaint</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

export default AddComplaint