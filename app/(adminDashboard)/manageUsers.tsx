import React, { useState, useEffect } from 'react';
import { View,Text,TextInput,TouchableOpacity,ScrollView,ActivityIndicator,Image,Alert,} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {collection,getDocs,doc,updateDoc,deleteDoc,query,} from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import Toast from 'react-native-toast-message';

const ManageUsers = () => {
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
        console.log('✅ Admin logged in:', currentUser.email, currentUser.uid);
        fetchUsers();
      } else {
        console.log('⚠️ No user logged in');
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
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const snapshot = await getDocs(q);

      console.log('Total users found:', snapshot.size);

      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (error: any) {
      console.error('Fetch error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load users',
        text2: error.message || 'Check permissions',
      });
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

  const getDisplayName = (user: any) =>
    user.displayName || user.name || user.email?.split('@')[0] || 'Unnamed';

  // Toggle single user selection
  const toggleUserSelect = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Select / Deselect All
  const selectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
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
  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  // Open role change modal
  const handleChangeRole = (user: any) => {
    setSelectedUser(user);
    setNewRole(user.role || 'user');
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
  const handleDeleteUser = (user: any) => {
    Alert.alert('Delete User', `Delete ${getDisplayName(user)}?`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'users', user.id));
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
          className="flex-row items-center mb-4"
        >
          <MaterialIcons
            name={
              selectedUsers.length === filteredUsers.length && filteredUsers.length > 0
                ? 'check-box'
                : 'check-box-outline-blank'
            }
            size={24}
            color="#2563eb"
          />
          <Text className="ml-2 text-gray-700 font-medium">
            {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0
              ? 'Deselect All'
              : 'Select All'}
          </Text>
        </TouchableOpacity>

        {/* Users List */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
          ) : filteredUsers.length === 0 ? (
            <Text className="text-center text-gray-500 mt-10">No users found</Text>
          ) : (
            filteredUsers.map((user) => (
              <View
                key={user.id}
                className="flex-row items-center bg-white p-4 mb-3 mx-2 rounded-xl shadow-sm border border-gray-100"
              >
                {/* Checkbox for bulk select */}
                <TouchableOpacity onPress={() => toggleUserSelect(user.id)} className="mr-3">
                  <MaterialIcons
                    name={selectedUsers.includes(user.id) ? 'check-circle' : 'radio-button-unchecked'}
                    size={24}
                    color={selectedUsers.includes(user.id) ? '#22c55e' : '#9ca3af'}
                  />
                </TouchableOpacity>

                {/* Avatar */}
                <Image
                  source={{
                    uri:
                      user.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(user))}&background=2563eb&color=fff`,
                  }}
                  className="w-12 h-12 rounded-full mr-4"
                />

                {/* Info */}
                <View className="flex-1">
                  <Text className="font-bold text-gray-900">{getDisplayName(user)}</Text>
                  <Text className="text-gray-600 text-sm">{user.email}</Text>
                </View>

                {/* Role Badge */}
                <View
                  className={`px-3 py-1 rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100' : 'bg-green-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      user.role === 'admin' ? 'text-purple-700' : 'text-green-700'
                    }`}
                  >
                    {user.role || 'User'}
                  </Text>
                </View>

                {/* View Details */}
                <TouchableOpacity onPress={() => handleViewDetails(user)} className="ml-3">
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