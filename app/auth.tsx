import * as SecureStore from "expo-secure-store";

export type DecodedToken = {
  id: string;
  name: string;
  email_id: string;
  mobile_number: string;
  role: string;
  exp?: number;
};

// Save user data
export const saveUserData = async (user: DecodedToken) => {
  await SecureStore.setItemAsync("User", JSON.stringify(user));
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
export const fetchAndSaveUser = async (): Promise<DecodedToken | null> => {
  try {
    const token = await getLoginJwtToken();
    if (!token) {
      console.log("No auth token found for fetching user.");
      return null;
    }

    const response = await fetch(
      "https://dev-backend-py-23809827867.us-east1.run.app/user/fetch",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Role": "user",
          "X-Token-Source": "firebase", // As seen in other parts of the app
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "Failed to fetch user data:",
        errorData.message || response.statusText
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
