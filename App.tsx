/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme, View, PermissionsAndroid, Platform, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import VoiceCallScreen from './src/screens/VoiceCallScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ZegoCallInvitationDialog, ZegoUIKitPrebuiltCallWaitingScreen, ZegoUIKitPrebuiltCallInCallScreen, ZegoSendCallInvitationButton } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { subscribeToUsers, type FirestoreUser } from './src/utils/usersService';
import { LocationTracker } from './src/components/LocationTracker';

// Zego credentials
const APP_ID = 797383271;
const APP_SIGN = '63e7962afd2097300852541e62cc9441466f1d430d88fb3e998afeff96a790a2';

const Stack = createNativeStackNavigator();

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  VoiceCall: {
    appID: number;
    appSign: string;
    userID: string;
    userName: string;
    callID: string;
  };
};

// User type for the users list (compatible with FirestoreUser)
interface UserItem {
  uid: string;
  displayName: string;
  email: string;
  status: 'online' | 'offline' | 'busy';
  isOnline: boolean;
  avatarUrl?: string;
}

function HomeScreen({ navigation }: any) {
  const isDarkMode = useColorScheme() === 'dark';
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'quick' | 'location'>('users');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState<'video' | 'voice'>('video');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Quick call states
  const [callId, setCallId] = useState<string>('room_1');

  // Subscribe to real-time users from Firestore
  useEffect(() => {
    if (!user?.uid) return;

    setLoadingUsers(true);
    const unsubscribe = subscribeToUsers(
      user.uid,
      (firestoreUsers) => {
        // Convert FirestoreUser to UserItem format
        const userItems: UserItem[] = firestoreUsers.map(u => ({
          uid: u.uid,
          displayName: u.displayName,
          email: u.email,
          status: u.status,
          isOnline: u.isOnline,
          avatarUrl: u.avatarUrl,
        }));
        setUsers(userItems);
        setLoadingUsers(false);
      },
      (error) => {
        console.error('Error loading users:', error);
        setLoadingUsers(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Filter users based on search query
  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Request media permissions for Android
    const requestMediaPermissions = async () => {
      if (Platform.OS !== 'android') return;

      try {
        const cameraGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        const audioGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);

        if (!cameraGranted || !audioGranted) {
          const result = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);
        }
      } catch (err) {
        console.log((err as Error).toString());
      }
    };

    requestMediaPermissions();
  }, []);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCallPress = (type: 'video' | 'voice') => {
    if (selectedUsers.length === 0) return;
    setCallType(type);
    setShowCallModal(true);
  };

  const handleConfirmCall = () => {
    const invitees = selectedUsers.map(userId => {
      const foundUser = users.find(u => u.uid === userId);
      return { userID: userId, userName: foundUser?.displayName || userId };
    });

    setShowCallModal(false);
    // The ZegoSendCallInvitationButton will handle the call
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#4caf50';
      case 'busy': return '#ff9800';
      case 'offline': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderUserItem = ({ item }: { item: UserItem }) => {
    const isSelected = selectedUsers.includes(item.uid);
    
    return (
      <TouchableOpacity 
        style={[styles.userCard, isSelected && styles.userCardSelected]}
        onPress={() => toggleUserSelection(item.uid)}
        activeOpacity={0.7}
      >
        <View style={styles.userCardLeft}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: isSelected ? '#0b74de' : '#e3f2fd' }]}>
              <Text style={[styles.avatarText, isSelected && { color: '#fff' }]}>
                {getInitials(item.displayName)}
              </Text>
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.displayName}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={[styles.userStatus, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderUsersTab = () => (
    <View style={styles.tabContent}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search users..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#999"
      />
      
      {selectedUsers.length > 0 && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>
            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
          </Text>
          <TouchableOpacity onPress={() => setSelectedUsers([])}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {loadingUsers ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#0b74de" />
          <Text style={styles.emptyText}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.userList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No users found matching your search' : 'No other users available'}
              </Text>
            </View>
          }
        />
      )}

      {selectedUsers.length > 0 && (
        <View style={styles.floatingActions}>
          <TouchableOpacity 
            style={[styles.floatingButton, styles.voiceButton]}
            onPress={() => handleCallPress('voice')}
          >
            <Text style={styles.floatingButtonText}>📞 Voice Call</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.floatingButton, styles.videoButton]}
            onPress={() => handleCallPress('video')}
          >
            <Text style={styles.floatingButtonText}>📹 Video Call</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderQuickCallTab = () => (
    <ScrollView contentContainerStyle={styles.quickCallContent}>
      <Text style={styles.quickCallTitle}>Quick Call Room</Text>
      <Text style={styles.quickCallSubtitle}>
        Join or create a call room with a room ID
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Room ID</Text>
        <TextInput
          style={styles.quickInput}
          placeholder="Enter room id (e.g., room_1)"
          value={callId}
          onChangeText={setCallId}
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, styles.buttonPrimary, !callId && styles.buttonDisabled]} 
        onPress={() => {
          if (callId) {
            navigation.navigate('VoiceCall', {
              appID: APP_ID,
              appSign: APP_SIGN,
              userID: user?.uid || '',
              userName: user?.displayName || user?.email?.split('@')[0] || '',
              callID: callId,
            });
          }
        }}
        disabled={!callId}
      >
        <Text style={styles.buttonText}>Join Room</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Video Calling</Text>
            <Text style={styles.headerSubtitle}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={handleSignOut}>
            <Text style={styles.headerButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'users' && styles.tabActive]}
            onPress={() => setActiveTab('users')}
          >
            <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
              Users
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'quick' && styles.tabActive]}
            onPress={() => setActiveTab('quick')}
          >
            <Text style={[styles.tabText, activeTab === 'quick' && styles.tabTextActive]}>
              Quick Call
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'location' && styles.tabActive]}
            onPress={() => setActiveTab('location')}
          >
            <Text style={[styles.tabText, activeTab === 'location' && styles.tabTextActive]}>
              Location
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {activeTab === 'users' && renderUsersTab()}
      {activeTab === 'quick' && renderQuickCallTab()}
      {activeTab === 'location' && <LocationTracker userId={user?.uid} />}

      {/* Call Confirmation Modal */}
      <Modal
        visible={showCallModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCallModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedUsers.length === 1 ? 'Start Call' : 'Start Group Call'}
            </Text>
            <Text style={styles.modalText}>
              You're about to start a {callType} call with {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''}.
            </Text>
            
            <View style={styles.modalCallButton}>
              <ZegoSendCallInvitationButton
                invitees={selectedUsers.map(userId => {
                  const foundUser = users.find(u => u.uid === userId);
                  return { userID: userId, userName: foundUser?.displayName || userId };
                })}
                isVideoCall={callType === 'video'}
                resourceID={"zego_call"}
              />
            </View>

            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowCallModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen 
        name="VoiceCall" 
        component={VoiceCallScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        // DO NOT change the name 
        name="ZegoUIKitPrebuiltCallWaitingScreen"
        component={ZegoUIKitPrebuiltCallWaitingScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        // DO NOT change the name
        name="ZegoUIKitPrebuiltCallInCallScreen"
        component={ZegoUIKitPrebuiltCallInCallScreen}
      />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const isDarkMode = useColorScheme() === 'dark';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0b74de" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {user ? <MainNavigator /> : <AuthNavigator />}
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
        <ZegoCallInvitationDialog />
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ff4444',
    borderRadius: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0b74de',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#0b74de',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  searchInput: {
    margin: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#e3f2fd',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0b74de',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff4444',
  },
  userList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  userCardSelected: {
    borderColor: '#0b74de',
    backgroundColor: '#f0f8ff',
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0b74de',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0b74de',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  floatingActions: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  floatingButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButton: {
    backgroundColor: '#4caf50',
  },
  videoButton: {
    backgroundColor: '#0b74de',
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickCallContent: {
    padding: 24,
    alignItems: 'center',
  },
  quickCallTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 40,
    marginBottom: 8,
  },
  quickCallSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  quickInput: {
    width: '100%',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#0b74de',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalCallButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default App;
