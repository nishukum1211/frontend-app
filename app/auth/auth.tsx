import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export type DecodedToken = {
  id: string;
  name: string;
  email_id: string;
  mobile_number: string;
  role: string;
  exp?: number;
};

// --- Custom Event Emitter ---
type AuthChangeListener = (user: DecodedToken | null) => void;
const listeners: AuthChangeListener[] = [];

export const addAuthChangeListener = (listener: AuthChangeListener) => {
  listeners.push(listener);
};

export const removeAuthChangeListener = (listener: AuthChangeListener) => {
  const index = listeners.indexOf(listener);
  if (index > -1) {
    listeners.splice(index, 1);
  }
};

const emitAuthChange = (user: DecodedToken | null) => {
  listeners.forEach(listener => listener(user));
};
// --- End Custom Event Emitter ---

// Save user data
export const saveUserData = async (user: DecodedToken) => {
  await SecureStore.setItemAsync("User", JSON.stringify(user));
  emitAuthChange(user); // Emit event on login
};


// Remove user data
export const removeUserData = async () => {
  await SecureStore.deleteItemAsync("User");
  emitAuthChange(null); // Emit event on logout
};

// Save JWT token
export const setLoginJwtToken = async (token: string) => {
  // console.log("Saving JWT token:", token);
  await SecureStore.setItemAsync("loginJwtToken", token);
};


// Remove JWT token
export const removeLoginJwtToken = async () => {
  await SecureStore.deleteItemAsync("loginJwtToken");
};

// Get JWT token
export const getLoginJwtToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync("loginJwtToken");
};




const ALL_CHATS_STORAGE_KEY = "allChats";

/**
 * Performs all necessary logout cleanup operations:
 * - Removes user data from SecureStore
 * - Removes JWT login token from SecureStore
 * - Clears all cached chat data from AsyncStorage
 * 
 * @returns {Promise<void>}
 */
export const logoutPostProcess = async (): Promise<void> => {
  try {
    // Remove user data from SecureStore
    await removeUserData();

    // Remove JWT token from SecureStore
    await removeLoginJwtToken();

    // Clear all cached chat data from AsyncStorage
    await AsyncStorage.removeItem(ALL_CHATS_STORAGE_KEY);

    console.log("Logout post-process completed successfully: user data, token, and chat cache cleared.");
  } catch (error) {
    console.error("Error during logout post-process:", error);
    throw error;
  }
};
