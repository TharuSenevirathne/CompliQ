import React, { useState, useEffect } from 'react';
import { View,Text,TextInput,TouchableOpacity,ScrollView,Image,ActivityIndicator,Alert,} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '@/services/firebase';
import { signOut, onAuthStateChanged, updateProfile,updateEmail,updatePassword,reauthenticateWithCredential,EmailAuthProvider} from 'firebase/auth';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const AdminProfile = () => {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [photoURL, setPhotoURL] = useState('');

  // Stats state
  const [stats, setStats] = useState({
    totalComplaints: 0,
    resolved: 0,
    pending: 0,
    inProgress: 0,
    activeUsers: 0,
    lastLogin: 'N/A',
  });

  // Fetch all system statistics
  const fetchSystemStats = async () => {
    try {
      setStatsLoading(true);

      // 1. Get all complaints
      const complaintsRef = collection(db, 'complaints');
      const complaintsSnapshot = await getDocs(complaintsRef);

      let total = 0;
      let pending = 0;
      let inProgress = 0;
      let resolved = 0;

      complaintsSnapshot.forEach((doc) => {
        const data = doc.data();
        total++;
        
        if (data.status === 'pending') {
          pending++;
        } else if (data.status === 'in-progress') {
          inProgress++;
        } else if (data.status === 'resolved') {
          resolved++;
        }
      });

      // 2. Get all users count
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const activeUsers = usersSnapshot.size;

      // 3. Get last login time
      const currentUser = auth.currentUser;
      let lastLogin = 'Today';
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.lastLogin) {
              const loginDate = userData.lastLogin.toDate();
              lastLogin = loginDate.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
            }
          }
        } catch (error) {
          console.error('Error fetching last login:', error);
        }
      }

      // Update stats state
      setStats({
        totalComplaints: total,
        resolved,
        pending,
        inProgress,
        activeUsers,
        lastLogin,
      });

      setStatsLoading(false);
    } catch (error) {
      console.error('Error fetching system stats:', error);
      setStatsLoading(false);
    }
  };

  // Load admin user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get admin data from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          let adminData = {
            displayName: user.displayName || 'Admin User',
            email: user.email || '',
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'Admin')}&background=2563eb&color=fff&size=128`,
            role: 'Admin',
            uid: user.uid
          };

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            adminData = {
              ...adminData,
              displayName: userData.displayName || adminData.displayName,
              photoURL: userData.photoURL || adminData.photoURL,
              role: userData.role === 'admin' ? 'Super Admin' : 'Admin',
            };
          }

          setAdmin(adminData);
          setDisplayName(adminData.displayName);
          setEmail(adminData.email);
          setPhotoURL(adminData.photoURL);

          // Fetch system statistics
          await fetchSystemStats();
        } catch (error) {
          console.error('Error loading admin data:', error);
        }
      } else {
        setAdmin(null);
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
    }
  };

  // Save profile changes
  const handleSave = async () => {
    if (!admin) return;

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Display name update
      if (displayName !== admin.displayName) {
        await updateProfile(user, { displayName });
      }

      // Email update
      if (email !== admin.email) {
        if (!currentPassword) {
          Alert.alert('Error', 'Current password required to change email');
          setSaving(false);
          return;
        }
        const credential = EmailAuthProvider.credential(admin.email, currentPassword);
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
        const credential = EmailAuthProvider.credential(admin.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setNewPassword('');
      }

      // Save to Firestore
      await updateDoc(doc(db, 'users', admin.uid), {
        displayName,
        photoURL,
        updatedAt: new Date(),
      });

      Alert.alert('Success', 'Profile updated successfully');
      setCurrentPassword('');
      setIsEditing(false);

      // Refresh admin data
      setAdmin({
        ...admin,
        displayName,
        email,
        photoURL
      });
    } catch (error: any) {
      console.error(error);
      Alert.alert('Update Failed', error.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from admin panel?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/(auth)/login');
            } catch (error: any) {
              Alert.alert('Logout Failed', error.message);
            }
          }
        }
      ]
    );
  };

  const handleRefresh = async () => {
    await fetchSystemStats();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600">Loading admin profile...</Text>
      </View>
    );
  }

  if (!admin) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-white">
        <MaterialIcons name="admin-panel-settings" size={64} color="#9ca3af" />
        <Text className="text-xl font-bold mb-4 mt-4">Access Denied</Text>
        <Text className="text-gray-600 mb-4 text-center">
          You need admin privileges to access this page
        </Text>
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
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-900 text-3xl font-bold">Admin Profile</Text>
            <Text className="text-blue-600 text-base mt-1 font-medium">
              Account Management
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleRefresh}
            className="w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center"
          >
            <MaterialIcons name="refresh" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Profile Picture & Info */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 items-center">
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            <View className="relative">
              <Image
                source={{ uri: photoURL }}
                className="w-24 h-24 rounded-full border-4 border-blue-100"
              />
              <View className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full shadow-md border-2 border-white">
                <MaterialIcons name="camera-alt" size={16} color="white" />
              </View>
            </View>
          </TouchableOpacity>
          
          <Text className="text-gray-900 text-2xl font-bold mt-4">
            {admin.displayName}
          </Text>
          <Text className="text-gray-600 mt-1">{admin.email}</Text>
          <View className="bg-blue-100 px-4 py-1 rounded-full mt-3">
            <Text className="text-blue-800 font-bold">{admin.role}</Text>
          </View>
        </View>

        {/* Account Information Card */}
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
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
              <Text className="text-gray-900 text-base font-medium">{displayName}</Text>
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
                <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase">
                  Current Password
                </Text>
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
                <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase">
                  New Password (Optional)
                </Text>
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
                    setDisplayName(admin.displayName);
                    setEmail(admin.email);
                    setPhotoURL(admin.photoURL);
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

        {/* System Stats */}
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-lg font-bold">System Overview</Text>
            {statsLoading && <ActivityIndicator size="small" color="#2563eb" />}
          </View>

          <View className="flex-row flex-wrap justify-between">
            <View className="w-[48%] bg-blue-50 rounded-xl p-4 mb-3 items-center">
              <MaterialIcons name="assignment" size={24} color="#2563eb" />
              <Text className="text-blue-600 text-2xl font-bold mt-2">
                {statsLoading ? '...' : stats.totalComplaints}
              </Text>
              <Text className="text-gray-600 text-sm mt-1">Complaints</Text>
            </View>

            <View className="w-[48%] bg-green-50 rounded-xl p-4 mb-3 items-center">
              <MaterialIcons name="check-circle" size={24} color="#22c55e" />
              <Text className="text-green-600 text-2xl font-bold mt-2">
                {statsLoading ? '...' : stats.resolved}
              </Text>
              <Text className="text-gray-600 text-sm mt-1">Resolved</Text>
            </View>

            <View className="w-[48%] bg-yellow-50 rounded-xl p-4 mb-3 items-center">
              <MaterialIcons name="pending" size={24} color="#eab308" />
              <Text className="text-yellow-600 text-2xl font-bold mt-2">
                {statsLoading ? '...' : stats.pending}
              </Text>
              <Text className="text-gray-600 text-sm mt-1">Pending</Text>
            </View>

            <View className="w-[48%] bg-purple-50 rounded-xl p-4 mb-3 items-center">
              <MaterialIcons name="people" size={24} color="#a855f7" />
              <Text className="text-purple-600 text-2xl font-bold mt-2">
                {statsLoading ? '...' : stats.activeUsers}
              </Text>
              <Text className="text-gray-600 text-sm mt-1">Users</Text>
            </View>
          </View>

          <View className="bg-gray-50 rounded-xl p-3 mt-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MaterialIcons name="schedule" size={16} color="#6b7280" />
                <Text className="text-gray-600 text-xs ml-2">Last login:</Text>
              </View>
              <Text className="text-gray-700 text-xs font-medium">{stats.lastLogin}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
          <Text className="text-gray-900 text-lg font-bold mb-4">Quick Actions</Text>

          <TouchableOpacity
            onPress={() => router.push('/manageUsers')}
            className="flex-row items-center py-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center mr-4">
              <MaterialIcons name="people" size={24} color="#2563eb" />
            </View>
            <Text className="text-gray-800 font-medium flex-1">Manage Users</Text>
            <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/manageComplaints')}
            className="flex-row items-center py-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center mr-4">
              <MaterialIcons name="assignment" size={24} color="#22c55e" />
            </View>
            <Text className="text-gray-800 font-medium flex-1">Manage Complaints</Text>
            <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/analytics')}
            className="flex-row items-center py-4"
          >
            <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center mr-4">
              <MaterialIcons name="analytics" size={24} color="#7c3aed" />
            </View>
            <Text className="text-gray-800 font-medium flex-1">View Analytics</Text>
            <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-600 py-4 rounded-2xl items-center shadow-md mb-8"
        >
          <View className="flex-row items-center">
            <MaterialIcons name="logout" size={20} color="white" />
            <Text className="text-white font-bold text-base ml-2">Logout from Admin Panel</Text>
          </View>
        </TouchableOpacity>

        {/* Footer */}
        <View className="items-center mb-6">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-blue-600 mr-2" />
            <Text className="text-gray-400 text-xs">
              Admin Panel • Powered by Tharu Senevirathne
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminProfile;