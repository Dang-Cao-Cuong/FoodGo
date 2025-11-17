import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Avatar,
  Title,
  Text,
  Button,
  TextInput,
  Card,
  Divider,
  HelperText,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

const ProfileScreen: React.FC = () => {
  const { user, logout, updateProfile, changePassword, isLoading } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  /**
   * Handle profile update
   */
  const handleUpdateProfile = async () => {
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  /**
   * Cancel edit
   */
  const handleCancelEdit = () => {
    setProfileData({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  /**
   * Validate password form
   */
  const validatePassword = (): boolean => {
    if (!passwordData.currentPassword) {
      Alert.alert('Error', 'Current password is required');
      return false;
    }
    
    if (!passwordData.newPassword) {
      Alert.alert('Error', 'New password is required');
      return false;
    }
    
    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return false;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      Alert.alert(
        'Error',
        'New password must contain uppercase, lowercase, and number'
      );
      return false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    
    return true;
  };

  /**
   * Handle change password
   */
  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPassword(false);
      
      Alert.alert('Success', 'Password changed successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={user.full_name.substring(0, 2).toUpperCase()}
            style={styles.avatar}
          />
          <Title style={styles.name}>{user.full_name}</Title>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.role}>
            {user.role === 'admin' ? '👑 Admin' : '👤 Customer'}
          </Text>
        </Card.Content>
      </Card>

      {/* Profile Information */}
      <Card style={styles.card}>
        <Card.Title title="Profile Information" />
        <Card.Content>
          {!isEditing ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Full Name:</Text>
                <Text style={styles.value}>{user.full_name}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{user.phone || 'Not set'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Verified:</Text>
                <Text style={styles.value}>
                  {user.is_verified ? '✅ Yes' : '❌ No'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Member Since:</Text>
                <Text style={styles.value}>
                  {new Date(user.created_at).toLocaleDateString()}
                </Text>
              </View>

              <Button
                mode="contained"
                onPress={() => setIsEditing(true)}
                style={styles.button}>
                Edit Profile
              </Button>
            </>
          ) : (
            <>
              <TextInput
                label="Full Name"
                value={profileData.full_name}
                onChangeText={(text) =>
                  setProfileData({ ...profileData, full_name: text })
                }
                mode="outlined"
                style={styles.input}
              />
              
              <TextInput
                label="Phone"
                value={profileData.phone}
                onChangeText={(text) =>
                  setProfileData({ ...profileData, phone: text })
                }
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
              />

              <View style={styles.buttonRow}>
                <Button
                  mode="outlined"
                  onPress={handleCancelEdit}
                  style={[styles.button, styles.buttonHalf]}
                  disabled={isLoading}>
                  Cancel
                </Button>
                
                <Button
                  mode="contained"
                  onPress={handleUpdateProfile}
                  loading={isLoading}
                  disabled={isLoading}
                  style={[styles.button, styles.buttonHalf]}>
                  Save
                </Button>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Change Password */}
      <Card style={styles.card}>
        <Card.Title title="Change Password" />
        <Card.Content>
          {!isChangingPassword ? (
            <Button
              mode="outlined"
              onPress={() => setIsChangingPassword(true)}
              style={styles.button}>
              Change Password
            </Button>
          ) : (
            <>
              <TextInput
                label="Current Password"
                value={passwordData.currentPassword}
                onChangeText={(text) =>
                  setPasswordData({ ...passwordData, currentPassword: text })
                }
                mode="outlined"
                secureTextEntry={!showPasswords.current}
                right={
                  <TextInput.Icon
                    icon={showPasswords.current ? 'eye-off' : 'eye'}
                    onPress={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                  />
                }
                style={styles.input}
              />
              
              <TextInput
                label="New Password"
                value={passwordData.newPassword}
                onChangeText={(text) =>
                  setPasswordData({ ...passwordData, newPassword: text })
                }
                mode="outlined"
                secureTextEntry={!showPasswords.new}
                right={
                  <TextInput.Icon
                    icon={showPasswords.new ? 'eye-off' : 'eye'}
                    onPress={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                  />
                }
                style={styles.input}
              />
              
              <TextInput
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChangeText={(text) =>
                  setPasswordData({ ...passwordData, confirmPassword: text })
                }
                mode="outlined"
                secureTextEntry={!showPasswords.confirm}
                right={
                  <TextInput.Icon
                    icon={showPasswords.confirm ? 'eye-off' : 'eye'}
                    onPress={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                  />
                }
                style={styles.input}
              />

              <View style={styles.buttonRow}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                    setIsChangingPassword(false);
                  }}
                  style={[styles.button, styles.buttonHalf]}
                  disabled={isLoading}>
                  Cancel
                </Button>
                
                <Button
                  mode="contained"
                  onPress={handleChangePassword}
                  loading={isLoading}
                  disabled={isLoading}
                  style={[styles.button, styles.buttonHalf]}>
                  Update Password
                </Button>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Button
        mode="contained"
        onPress={handleLogout}
        buttonColor="#D32F2F"
        style={styles.logoutButton}>
        Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#000',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  buttonHalf: {
    flex: 1,
  },
  logoutButton: {
    marginBottom: 32,
  },
});

export default ProfileScreen;
