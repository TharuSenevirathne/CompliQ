import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/hooks/useAuth';

const ManageUsers = () => {
  const { user: currentAdmin } = useAuth(); 
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]); 
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');

  // Fetch users
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        console.log(' Admin logged in:', currentUser.email, currentUser.uid);
        fetchUsers();
      } else {
        console.log(' No user logged in');
        setLoading(false);
        Toast.show({ type: 'error', text1: 'Please login as admin' });
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching users from Firestore...");

      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const snapshot = await getDocs(q);

      console.log('Total documents found:', snapshot.size);
      console.log('First few docs:', snapshot.docs.slice(0, 3).map(d => d.data()));

      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('Users list length:', usersList.length);

      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (error: any) {
      console.error('Fetch error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      Alert.alert(
        'Error Loading Users',
        error.message || 'Failed to load users. Check permissions or network.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Search & Filter
  useEffect(() => {
    let result = users;
    if (filterRole !== 'all') {
      result = result.filter((u) => (u.role || 'user') === filterRole);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          (u.displayName || u.name || '').toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }
    setFilteredUsers(result);
  }, [searchQuery, filterRole, users]);

  const getDisplayName = (u: any) =>
    u.displayName || u.name || u.email?.split('@')[0] || 'Unnamed';

  // Toggle single user selection
  const toggleUserSelect = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Select / Deselect All
  const selectAll = () => {
    if (filteredUsers.length === 0) return;

    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
      Toast.show({ type: 'info', text1: 'All deselected' });
    } else {
      const allIds = filteredUsers.map((u) => u.id);
      setSelectedUsers(allIds);
      Toast.show({ 
        type: 'success', 
        text1: `${allIds.length} users selected` 
      });
    }
  };

  // Bulk delete selected users
  const bulkDelete = () => {
    if (selectedUsers.length === 0) return;

    Alert.alert(
      'Bulk Delete',
      `Delete ${selectedUsers.length} user(s)? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const id of selectedUsers) {
                await deleteDoc(doc(db, 'users', id));
              }
              Toast.show({
                type: 'success',
                text1: `Deleted ${selectedUsers.length} users`,
              });
              setSelectedUsers([]);
              fetchUsers();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Bulk delete failed',
                text2: error.message,
              });
            }
          },
        },
      ]
    );
  };

  // Open user detail modal
  const handleViewDetails = (u: any) => {
    setSelectedUser(u);
    setShowDetailModal(true);
  };

  // Open role change modal
  const handleChangeRole = (u: any) => {
    setSelectedUser(u);
    setNewRole(u.role || 'user');
    setShowRoleModal(true);
  };

  // Update user role
  const handleUpdateRole = async () => {
    if (!selectedUser?.id || !newRole) return;
    try {
      await updateDoc(doc(db, 'users', selectedUser.id), {
        role: newRole,
        updatedAt: new Date(),
      });
      Toast.show({ type: 'success', text1: 'Role Updated' });
      setShowRoleModal(false);
      fetchUsers();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Failed', text2: error.message });
    }
  };

  // Delete single user
  const handleDeleteUser = (u: any) => {
    Alert.alert('Delete User', `Delete ${getDisplayName(u)}?`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'users', u.id));
            Toast.show({ type: 'success', text1: 'User Deleted' });
            setShowDetailModal(false);
            fetchUsers();
          } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Delete Failed', text2: error.message });
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-6 shadow-sm">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-gray-900">Manage Users</Text>
            <Text className="text-blue-600 mt-1">{users.length} Total Users</Text>
          </View>
          <TouchableOpacity onPress={fetchUsers}>
            <MaterialIcons name="refresh" size={32} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="p-6">
        {/* Search */}
        <View className="flex-row items-center bg-white rounded-xl px-4 py-3 mb-4 shadow-sm border border-gray-100">
          <MaterialIcons name="search" size={24} color="#2563eb" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters & Bulk Actions */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row space-x-2">
            {['all', 'user', 'admin'].map((role) => (
              <TouchableOpacity
                key={role}
                onPress={() => setFilterRole(role)}
                className={`px-4 py-2 rounded-full ${
                  filterRole === role ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <Text className={filterRole === role ? 'text-white' : 'text-gray-700'}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedUsers.length > 0 && (
            <TouchableOpacity
              onPress={bulkDelete}
              className="bg-red-600 px-4 py-2 rounded-xl flex-row items-center"
            >
              <MaterialIcons name="delete" size={20} color="white" />
              <Text className="text-white ml-2 font-medium">Delete ({selectedUsers.length})</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Select All */}
        <TouchableOpacity 
          onPress={selectAll}
          className="flex-row items-center mb-4 bg-gray-100 px-4 py-3 rounded-xl"
        >
          <MaterialIcons
            name={
              selectedUsers.length === filteredUsers.length && filteredUsers.length > 0
                ? 'check-box'
                : 'check-box-outline-blank'
            }
            size={28}
            color="#2563eb"
          />
          <Text className="ml-3 text-gray-800 font-medium">
            {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0
              ? 'Deselect All'
              : `Select All (${filteredUsers.length})`}
          </Text>
        </TouchableOpacity>

        {/* Users List */}
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ 
            flexGrow: 1,
            paddingBottom: 100,
            minHeight: '100%'
          }}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
          ) : filteredUsers.length === 0 ? (
            <View className="items-center justify-center flex-1 mt-20">
              <Text className="text-gray-500 text-lg">No users found</Text>
              <Text className="text-gray-400 mt-2">
                {users.length} users in state, but filtered to 0
              </Text>
              <Text className="text-red-500 mt-4">
                Filter: {filterRole} | Search: "{searchQuery}"
              </Text>
            </View>
          ) : (
            filteredUsers.map((currentUser) => (
              <View
                key={currentUser.id}
                className="flex-row items-center bg-white p-4 mb-3 mx-2 rounded-xl shadow-sm border border-gray-100"
              >
                {/* Checkbox for bulk select */}
                <TouchableOpacity 
                  onPress={() => toggleUserSelect(currentUser.id)}
                  activeOpacity={0.7}
                  className="mr-3 p-1"
                >
                  <MaterialIcons
                    name={selectedUsers.includes(currentUser.id) ? 'check-circle' : 'radio-button-unchecked'}
                    size={28}
                    color={selectedUsers.includes(currentUser.id) ? '#22c55e' : '#9ca3af'}
                  />
                </TouchableOpacity>

                {/* Avatar */}
                <Image
                  source={{
                    uri:
                      currentUser.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(currentUser))}&background=2563eb&color=fff`,
                  }}
                  className="w-12 h-12 rounded-full mr-4"
                />

                {/* Info */}
                <View className="flex-1">
                  <Text className="font-bold text-gray-900">{getDisplayName(currentUser)}</Text>
                  <Text className="text-gray-600 text-sm">{currentUser.email}</Text>
                </View>

                {/* Role Badge */}
                <View
                  className={`px-3 py-1 rounded-full ${
                    currentUser.role === 'admin' ? 'bg-purple-100' : 'bg-green-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      currentUser.role === 'admin' ? 'text-purple-700' : 'text-green-700'
                    }`}
                  >
                    {currentUser.role || 'User'}
                  </Text>
                </View>

                {/* View Details */}
                <TouchableOpacity onPress={() => handleViewDetails(currentUser)} className="ml-3">
                  <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default ManageUsers;