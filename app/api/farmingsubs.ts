import { Alert } from "react-native";
import { getLoginJwtToken } from "../auth/auth";
import { AppConfig } from "../config";
import { SubscriptionCreate } from "./subscription";
import { User } from "./user";

/**
 * Defines the structure for creating a farming subscription.
 */
export interface FarmingSubscriptionCreate {
    duration_days: string;
    price: number;
}

/**
 * Defines the structure for a farming subscription item.
 */
export interface FarmingSubscriptionItem extends FarmingSubscriptionCreate {
    id: string;
    live: boolean;
}

/**
 * Provides services related to farming subscriptions.
 */
export class FarmingSubscriptionService {
    /**
     * Creates a new farming subscription.
     * @param {FarmingSubscriptionCreate} data - The subscription creation data.
     * @returns {Promise<boolean>} True if the subscription was created successfully, false otherwise.
     */
    public static async createFarmingCourse(data: FarmingSubscriptionCreate): Promise<boolean> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return false;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/course/farming/subscription/create`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to create farming subscription: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to create farming subscription: ${response.status} ${response.statusText}`);
                return false;
            }

            return true;
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while creating the farming course.');
            console.error("Error in FarmingSubscriptionService.createFarmingCourse:", error);
            return false;
        }
    }

    /**
     * Fetches a list of all farming subscriptions.
     * @returns {Promise<FarmingSubscriptionItem[] | null>} A list of farming subscriptions or null if an error occurs.
     */
    public static async listFarmingCourses(): Promise<FarmingSubscriptionItem[] | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/course/farming/subscription/list`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to list farming subscriptions: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to list farming subscriptions: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json() as FarmingSubscriptionItem[];
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while listing farming courses.');
            console.error("Error in FarmingSubscriptionService.listFarmingCourses:", error);
            return null;
        }
    }

    /**
     * Sets a farming subscription to be live.
     * @param {string} courseId - The ID of the subscription course to set as live.
     * @returns {Promise<boolean>} True if the operation was successful, false otherwise.
     */
    public static async goLive(courseId: string): Promise<boolean> {
        return FarmingSubscriptionService.updateLiveStatus(courseId, "live");
    }

    /**
     * Takes a farming subscription down (makes it not live).
     * @param {string} courseId - The ID of the subscription course to take down.
     * @returns {Promise<boolean>} True if the operation was successful, false otherwise.
     */
    public static async goDown(courseId: string): Promise<boolean> {
        return FarmingSubscriptionService.updateLiveStatus(courseId, "down");
    }

    /**
     * Updates the live status of a farming subscription.
     * @param {string} courseId - The ID of the course.
     * @param {"live" | "down"} status - The status to set.
     * @returns {Promise<boolean>} True if successful, false otherwise.
     */
    private static async updateLiveStatus(courseId: string, status: "live" | "down"): Promise<boolean> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return false;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/course/farming/subscription/${status}/${courseId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to update live status to ${status}: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to update live status to ${status}: ${response.status} ${response.statusText}`);
                return false;
            }
            return true;
        } catch (error) {
            Alert.alert('Error', `An unexpected error occurred while updating live status.`);
            console.error(`Error in FarmingSubscriptionService.updateLiveStatus (${status}):`, error);
            return false;
        }
    }

    /**
     * Creates an offline farming subscription for a user.
     * @param {SubscriptionCreate} data - The subscription creation data.
     * @param {string} user_id - The ID of the user.
     * @returns {Promise<boolean>} True if successful, false otherwise.
     */
    public static async createOfflineFarmingSubscription(data: SubscriptionCreate, user_id: string): Promise<boolean> {
        console.log(data);
        console.log(user_id);
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return false;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/subscription/farming/offline/create?user_id=${encodeURIComponent(user_id)}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Token-Source": "password",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to create offline farming subscription: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.log(`Failed to create offline farming subscription: ${response.status} ${response.statusText}`);
                return false;
            }

            return true;
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred during the offline subscription creation.');
            console.log("Error in FarmingSubscriptionService.createOfflineFarmingSubscription:", error);
            return false;
        }
    }

    /**
     * Updates a farming subscription course.
     * @param {string} courseId - The ID of the course to update.
     * @param {FarmingSubscriptionCreate} data - The new data for the course.
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    public static async updateFarmingCourse(courseId: string, data: FarmingSubscriptionCreate): Promise<boolean> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return false;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/course/farming/subscription/update/${courseId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to update farming subscription: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to update farming subscription: ${response.status} ${response.statusText}`);
                return false;
            }
            return true;
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while updating the farming course.');
            console.error("Error in FarmingSubscriptionService.updateFarmingCourse:", error);
            return false;
        }
    }

    /**
     * Fetches a list of users with farming subscriptions.
     * @returns {Promise<UserFarmingSubscription[] | null>} A list of users or null if an error occurs.
     */
    public static async getFarmingSubscriptionUsers(): Promise<User[] | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/subscription/farming/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to list farming subscription users: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to list farming subscription users: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json() as User[];
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while fetching subscription users.');
            console.error("Error in FarmingSubscriptionService.getFarmingSubscriptionUsers:", error);
            return null;
        }
    }
}