import React, { useState, useEffect } from 'react';
import {  View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { auth, db } from '@/services/firebase';
import {  updateProfile, updateEmail, updatePassword, signOut, onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch complaint stats from Firebase
  const fetchComplaintStats = async (userId: string) => {
    try {
      setStatsLoading(true);
      
      // Query complaints collection for this user
      const complaintsRef = collection(db, 'complaints');
      const q = query(complaintsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      let total = 0;
      let pending = 0;
      let resolved = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        total++;
        
        if (data.status === 'pending') {
          pending++;
        } else if (data.status === 'resolved') {
          resolved++;
        }
      });

      setStats({
        total,
        pending,
        resolved
      });

      setStatsLoading(false);
    } catch (error) {
      console.error('Error fetching complaint stats:', error);
      setStatsLoading(false);
    }
  };

  // User load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setEmail(currentUser.email || '');
        setPhotoURL(currentUser.photoURL || '');

        // Get extra data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setDisplayName(data.displayName || currentUser.displayName || '');
            setPhotoURL(data.photoURL || currentUser.photoURL || '');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }

        // Fetch complaint statistics
        await fetchComplaintStats(currentUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Profile picture upload
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const uri = result.assets[0].uri;
      setPhotoURL(uri);
      Alert.alert('Success', 'Profile picture updated (preview)');
    }
  };

  // Save profile changes
  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Display name update
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      // Email update
      if (email !== user.email) {
        if (!currentPassword) {
          Alert.alert('Error', 'Current password required to change email');
          setSaving(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, email);
      }

      // Password update
      if (newPassword) {
        if (!currentPassword) {
          Alert.alert('Error', 'Current password required to change password');
          setSaving(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setNewPassword('');
      }

      // Save to Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        photoURL,
        updatedAt: new Date(),
      });

      Alert.alert('Success', 'Profile updated successfully');
      setCurrentPassword('');
      setIsEditing(false);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Update Failed', error.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
  Toast.show({
    type: 'info',
    text1: 'Confirm Logout',
    text2: 'Tap this message to logout',
    visibilityTime: 5000, // 5 seconds
    position: 'top',
    topOffset: 60,
    onPress: async () => {
      try {
        await signOut(auth);
        Toast.show({
          type: 'success',
          text1: 'Logged Out',
          text2: 'See you again!',
          visibilityTime: 3000,
        });
        router.replace('/(auth)/login');
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Logout Failed',
          text2: error.message || 'Something went wrong',
        });
      }
    },
  });
};

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-600 mt-4">Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-white">
        <MaterialIcons name="person-off" size={64} color="#9ca3af" />
        <Text className="text-xl font-bold mb-4 mt-4">Please login first</Text>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          className="bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Decorative background */}
      <View className="absolute top-[-100] right-[-100] w-80 h-80 rounded-full bg-blue-50 opacity-30" />
      
      {/* Header */}
      <View className="bg-white pt-14 pb-8 px-6 shadow-sm">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-gray-900 text-3xl font-bold">Profile</Text>
            <Text className="text-blue-600 text-base mt-1 font-medium">Manage your account</Text>
          </View>
          <View className="w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center">
            <MaterialIcons name="person" size={28} color="white" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View className="items-center py-6 px-6">
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            <View className="relative">
              <View className="w-32 h-32 rounded-full bg-blue-100 items-center justify-center border-4 border-white shadow-lg">
                {photoURL ? (
                  <Image
                    source={{ uri: photoURL }}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <MaterialIcons name="person" size={64} color="#2563eb" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 bg-blue-600 p-3 rounded-full shadow-md border-2 border-white">
                <MaterialIcons name="camera-alt" size={20} color="white" />
              </View>
            </View>
          </TouchableOpacity>
          <Text className="text-gray-900 text-2xl font-bold mt-4">
            {displayName || 'User'}
          </Text>
          <Text className="text-gray-500 mt-1">{email}</Text>
        </View>

        {/* Info Cards */}
        <View className="px-6 mb-6">
          {/* Account Info Card */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-lg font-bold">Account Information</Text>
              {!isEditing && (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  className="bg-blue-50 px-4 py-2 rounded-lg"
                >
                  <Text className="text-blue-600 font-semibold">Edit</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Display Name */}
            <View className="mb-4">
              <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase">Display Name</Text>
              {isEditing ? (
                <TextInput
                  className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your name"
                  placeholderTextColor="#9ca3af"
                />
              ) : (
                <Text className="text-gray-900 text-base font-medium">{displayName || 'Not set'}</Text>
              )}
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase">Email</Text>
              {isEditing ? (
                <TextInput
                  className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                />
              ) : (
                <Text className="text-gray-900 text-base font-medium">{email}</Text>
              )}
            </View>

            {isEditing && (
              <>
                {/* Current Password */}
                <View className="mb-4">
                  <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase">Current Password</Text>
                  <TextInput
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                    placeholder="Required for email/password changes"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                {/* New Password */}
                <View className="mb-4">
                  <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase">New Password (Optional)</Text>
                  <TextInput
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    placeholder="Leave blank if not changing"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                {/* Action Buttons */}
                <View className="flex-row mt-2">
                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className={`flex-1 py-3 rounded-xl items-center mr-2 ${
                      saving ? 'bg-blue-400' : 'bg-blue-600'
                    }`}
                  >
                    {saving ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-bold">Save Changes</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setIsEditing(false);
                      setDisplayName(user.displayName || '');
                      setEmail(user.email || '');
                      setCurrentPassword('');
                      setNewPassword('');
                    }}
                    className="flex-1 py-3 rounded-xl bg-gray-200 items-center ml-2"
                  >
                    <Text className="text-gray-700 font-bold">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Account Stats Card - WITH REAL DATA */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-lg font-bold">Account Stats</Text>
              {statsLoading && <ActivityIndicator size="small" color="#2563eb" />}
            </View>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
                  <MaterialIcons name="description" size={20} color="#2563eb" />
                </View>
                <Text className="text-gray-700 font-medium">Total Complaints</Text>
              </View>
              <Text className="text-gray-900 font-bold text-lg">
                {statsLoading ? '...' : stats.total}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-yellow-50 items-center justify-center mr-3">
                  <MaterialIcons name="pending" size={20} color="#eab308" />
                </View>
                <Text className="text-gray-700 font-medium">Pending</Text>
              </View>
              <Text className="text-gray-900 font-bold text-lg">
                {statsLoading ? '...' : stats.pending}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-3">
                  <MaterialIcons name="check-circle" size={20} color="#22c55e" />
                </View>
                <Text className="text-gray-700 font-medium">Resolved</Text>
              </View>
              <Text className="text-gray-900 font-bold text-lg">
                {statsLoading ? '...' : stats.resolved}
              </Text>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 py-4 rounded-xl items-center shadow-md mb-6"
          >
            <View className="flex-row items-center">
              <MaterialIcons name="logout" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">Logout</Text>
            </View>
          </TouchableOpacity>

          {/* Footer */}
          <View className="items-center mb-4">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-blue-600 mr-2" />
              <Text className="text-gray-400 text-xs">Powered by Tharu Senevirathne</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}