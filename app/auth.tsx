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

// // Get user data
// export const getUserData = async (): Promise<DecodedToken | null> => {
//   const userData = await SecureStore.getItemAsync("User");
//   return userData ? JSON.parse(userData) : null;
// };


// Mock function to simulate a logged-in user
export const getUserData = async (): Promise<DecodedToken | null> => {
  // Mock user data
  const mockUser: DecodedToken = {
    id: "123",
    name: "Alice Johnson",
    email_id: "alice@example.com",
    mobile_number: "1234567890",
    role: "chat", // change to "agent" to test agent view
    exp: Math.floor(Date.now() / 1000) + 3600, // expires in 1 hour
  };

  // Simulate a small delay like fetching from storage
  await new Promise((resolve) => setTimeout(resolve, 500));

  return mockUser;
};
// Remove user data
export const removeUserData = async () => {
  await SecureStore.deleteItemAsync("User");
};
