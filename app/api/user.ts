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
 * Defines the structure for the response of OTP verification.
 */
export interface VerifyOtpResponse {
    isNew: boolean;
    message: string;
    token: string;
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
                console.log(`Failed to fetch user: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json() as User;
        } catch (error) {
            console.log("Error in UserService.fetchUserByMobileNumber:", error);
            return null;
        }
    }

    /**
     * Sends an OTP to the given mobile number.
     * @param {string} mobileNumber - The mobile number to send the OTP to.
     * @returns {Promise<{message: string} | null>} A message indicating success or null on failure.
     */
    public static async sendOtp(mobileNumber: string): Promise<{message: string} | null> {
        try {
            const response = await fetch(`${AppConfig.API_BASE_URL}/user/otp/send?mobile_number=${encodeURIComponent(mobileNumber)}`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json'
                }
            });

            if (!response.ok) {
                console.log(`Failed to send OTP: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            console.log("Error in UserService.sendOtp:", error);
            return null;
        }
    }

    /**
     * Verifies the OTP for the given mobile number.
     * @param {string} mobileNumber - The mobile number to verify.
     * @param {string} otp - The OTP to verify.
     * @returns {Promise<VerifyOtpResponse | null>} User authentication details or null on failure.
     */
    public static async verifyOtp(mobileNumber: string, otp: string): Promise<VerifyOtpResponse | null> {
        try {
            const response = await fetch(`${AppConfig.API_BASE_URL}/user/otp/verify?mobile_number=${encodeURIComponent(mobileNumber)}&otp=${encodeURIComponent(otp)}`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'X-Role': 'user'
                }
            });

            if (!response.ok) {
                console.log(`Failed to verify OTP: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json() as VerifyOtpResponse;
        } catch (error) {
            console.log("Error in UserService.verifyOtp:", error);
            return null;
        }
    }
}