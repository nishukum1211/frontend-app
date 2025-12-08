import { getLoginJwtToken } from "../auth/auth";
import { AppConfig } from "../config";

/**
 * Defines the structure for a user object.
 * This corresponds to the UserResponse from the backend.
 */
export interface User {
    id: string;
    name: string;
    email_id: string | null;
    mobile_number: string;
    role: string;
}

/**
 * Provides services related to user data.
 */
export class UserService {
    /**
     * Fetches user details by their mobile number.
     * @param {string} mobileNumber - The mobile number of the user to fetch.
     * @returns {Promise<User | null>} The user object or null if an error occurs or the user is not found.
     */
    public static async fetchUserByMobileNumber(mobileNumber: string): Promise<User | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/user/fetch/mb?mobile_number=${encodeURIComponent(mobileNumber)}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Token-Source": "password",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
            }

            return await response.json() as User;
        } catch (error) {
            console.error("Error in UserService.fetchUserByMobileNumber:", error);
            return null;
        }
    }
}
