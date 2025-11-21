import * as SecureStore from "expo-secure-store";
import { fetchAllChatsAndCache } from "../chatCache";
import { DecodedToken, getLoginJwtToken, saveUserData } from "./auth";


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

    // After successfully getting user data, fetch and cache all chats
    await fetchAllChatsAndCache(role);

    return userData;
  } catch (error) {
    console.error("Error during fetchAndSaveUser:", error);
    return null;
  }
};
