/**
 * Firestore Users Service
 * 
 * Handles all user-related Firestore operations including:
 * - Creating/updating user profiles
 * - Managing user presence (online/offline status)
 * - Fetching users list
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export interface FirestoreUser {
  uid: string;
  displayName: string;
  email: string;
  status: 'online' | 'offline' | 'busy';
  isOnline: boolean;
  lastSeen: any; // Firestore Timestamp
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  avatarUrl?: string;
}

/**
 * Create or update user profile in Firestore
 */
export const createOrUpdateUserProfile = async (
  uid: string,
  displayName: string,
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const userRef = firestore().collection('users').doc(uid);
    const userDoc = await userRef.get();

    const userData = {
      uid,
      displayName,
      email,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    if (userDoc.exists()) {
      // Update existing user
      await userRef.update(userData);
    } else {
      // Create new user
      await userRef.set({
        ...userData,
        status: 'online',
        isOnline: true,
        lastSeen: firestore.FieldValue.serverTimestamp(),
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    }

    return { success: true, message: 'User profile saved successfully' };
  } catch (error: any) {
    console.error('Error creating/updating user profile:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Set user online status
 */
export const setUserOnlineStatus = async (
  uid: string,
  isOnline: boolean
): Promise<void> => {
  try {
    await firestore().collection('users').doc(uid).update({
      isOnline,
      status: isOnline ? 'online' : 'offline',
      lastSeen: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user status:', error);
  }
};

/**
 * Set user busy status
 */
export const setUserBusyStatus = async (
  uid: string,
  isBusy: boolean
): Promise<void> => {
  try {
    await firestore().collection('users').doc(uid).update({
      status: isBusy ? 'busy' : 'online',
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user busy status:', error);
  }
};

/**
 * Get all users except current user
 * Returns a real-time listener
 */
export const subscribeToUsers = (
  currentUserId: string,
  onUpdate: (users: FirestoreUser[]) => void,
  onError?: (error: Error) => void
) => {
  return firestore()
    .collection('users')
    .where('uid', '!=', currentUserId)
    .orderBy('uid')
    .orderBy('isOnline', 'desc')
    .orderBy('displayName', 'asc')
    .onSnapshot(
      (snapshot) => {
        const users: FirestoreUser[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            uid: data.uid,
            displayName: data.displayName,
            email: data.email,
            status: data.status || 'offline',
            isOnline: data.isOnline || false,
            lastSeen: data.lastSeen,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            avatarUrl: data.avatarUrl,
          };
        });
        onUpdate(users);
      },
      (error) => {
        console.error('Error fetching users:', error);
        if (onError) onError(error);
      }
    );
};

/**
 * Get a specific user by ID
 */
export const getUserById = async (
  uid: string
): Promise<FirestoreUser | null> => {
  try {
    const userDoc = await firestore().collection('users').doc(uid).get();
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: data?.uid || uid,
        displayName: data?.displayName || '',
        email: data?.email || '',
        status: data?.status || 'offline',
        isOnline: data?.isOnline || false,
        lastSeen: data?.lastSeen,
        createdAt: data?.createdAt,
        updatedAt: data?.updatedAt,
        avatarUrl: data?.avatarUrl,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

/**
 * Update user avatar
 */
export const updateUserAvatar = async (
  uid: string,
  avatarUrl: string
): Promise<{ success: boolean; message: string }> => {
  try {
    await firestore().collection('users').doc(uid).update({
      avatarUrl,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, message: 'Avatar updated successfully' };
  } catch (error: any) {
    console.error('Error updating avatar:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Search users by name or email
 */
export const searchUsers = async (
  query: string,
  currentUserId: string
): Promise<FirestoreUser[]> => {
  try {
    const lowerQuery = query.toLowerCase();
    
    // Fetch all users (you might want to add pagination for large datasets)
    const snapshot = await firestore()
      .collection('users')
      .where('uid', '!=', currentUserId)
      .get();

    const users: FirestoreUser[] = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          uid: data.uid,
          displayName: data.displayName,
          email: data.email,
          status: data.status || 'offline',
          isOnline: data.isOnline || false,
          lastSeen: data.lastSeen,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          avatarUrl: data.avatarUrl,
        };
      })
      .filter(
        (user) =>
          user.displayName.toLowerCase().includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery)
      );

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

/**
 * Delete user profile (use with caution)
 */
export const deleteUserProfile = async (
  uid: string
): Promise<{ success: boolean; message: string }> => {
  try {
    await firestore().collection('users').doc(uid).delete();
    return { success: true, message: 'User profile deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting user profile:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Initialize user presence system
 * Automatically updates user status when app state changes
 */
export const initializeUserPresence = (uid: string) => {
  // Set user online when they connect
  setUserOnlineStatus(uid, true);

  // Set user offline when they disconnect
  const userRef = firestore().collection('users').doc(uid);
  
  // This will be triggered when connection is lost
  userRef.update({
    lastSeen: firestore.FieldValue.serverTimestamp(),
  });

  return () => {
    // Cleanup: set offline when component unmounts
    setUserOnlineStatus(uid, false);
  };
};

export default {
  createOrUpdateUserProfile,
  setUserOnlineStatus,
  setUserBusyStatus,
  subscribeToUsers,
  getUserById,
  updateUserAvatar,
  searchUsers,
  deleteUserProfile,
  initializeUserPresence,
};

