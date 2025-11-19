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

// Get user data
export const getUserData = async (): Promise<DecodedToken | null> => {
  const storedUserData = await SecureStore.getItemAsync("User");
  if (storedUserData) {
    return JSON.parse(storedUserData);
  }

  // If no user data is stored, check for a token and try to fetch.
  const token = await getLoginJwtToken();
  if (token) {
    return await fetchAndSaveUser();
  }
  return null;
};



// Remove user data
export const removeUserData = async () => {
  await SecureStore.deleteItemAsync("User");
  emitAuthChange(null); // Emit event on logout
};

// Save JWT token
export const setLoginJwtToken = async (token: string) => {
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

/**
 * Fetches user data from the backend and saves it to SecureStore.
 * This calls the GET /user/fetch endpoint.
 * @returns {Promise<DecodedToken | null>} The user data if successful, otherwise null.
 */
export const fetchAndSaveUser = async (
  role: "user" | "agent" = "user",
  tokenSource: "firebase" | "password" = "firebase"
): Promise<DecodedToken | null> => {
  try {
    const token = await getLoginJwtToken();
    if (!token) {
      console.log("No auth token found for fetching user.");
      return null;
    }
        console.log(tokenSource, role)
    const response = await fetch(
      "https://dev-backend-py-23809827867.us-east1.run.app/user/fetch",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Role": role,
          "X-Token-Source": tokenSource,
        },
      }
    );


    if (!response.ok) {
      // Try to parse error response, but don't fail if it's not JSON
      let errorBody = "Could not parse error response.";
      try { errorBody = await response.json(); } catch (e) { /* ignore */ }
      console.error(
        "Failed to fetch user data:",
        (errorBody as any)?.message || (errorBody as any)?.detail || response.statusText || `HTTP ${response.status}`
      );
      return null;
    }

    const userData: DecodedToken = await response.json();
    await saveUserData(userData); // Save the fetched user data

    return userData;
  } catch (error) {
    console.error("Error during fetchAndSaveUser:", error);
    return null;
  }
};
