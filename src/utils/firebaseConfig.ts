/**
 * Firebase Configuration Utilities
 * 
 * This file provides helper functions for Firebase operations.
 * The Firebase configuration is automatically loaded from google-services.json
 */

import auth from '@react-native-firebase/auth';

/**
 * Get the current authenticated user
 */
export const getCurrentUser = () => {
  return auth().currentUser;
};

/**
 * Check if a user is currently authenticated
 */
export const isAuthenticated = () => {
  return auth().currentUser !== null;
};

/**
 * Get user authentication token
 */
export const getUserToken = async () => {
  const user = auth().currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string) => {
  try {
    await auth().sendPasswordResetEmail(email);
    return { success: true, message: 'Password reset email sent' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (displayName: string, photoURL?: string) => {
  try {
    const user = auth().currentUser;
    if (user) {
      await user.updateProfile({
        displayName,
        photoURL,
      });
      return { success: true, message: 'Profile updated successfully' };
    }
    return { success: false, message: 'No user logged in' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

/**
 * Delete user account
 */
export const deleteUserAccount = async () => {
  try {
    const user = auth().currentUser;
    if (user) {
      await user.delete();
      return { success: true, message: 'Account deleted successfully' };
    }
    return { success: false, message: 'No user logged in' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export default {
  getCurrentUser,
  isAuthenticated,
  getUserToken,
  sendPasswordResetEmail,
  updateUserProfile,
  deleteUserAccount,
};

