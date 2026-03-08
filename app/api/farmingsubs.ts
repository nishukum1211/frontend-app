import { Alert } from "react-native";
import { getLoginJwtToken } from "../auth/auth";
import { AppConfig } from "../config";
import { User } from "./user";

/**
 * Defines the structure for subscription.
 */
export interface Subscription {
    subscription_id: string;
    user_id: string;
    course_id: string;
    start_date: Date;
    duration_days: number;
    price: number;
    order_id: string;
    expiry_date?: Date;
    type: string;
}

/**
 * Defines the structure for creating a subscription.
 */
export interface SubscriptionCreate {
    course_id: string;
    order_id: string;
}

/**
 * Defines the structure for offline subscription creation.
 */
export interface SubscriptionOfflineCreate {
    course_id: string;
    order_id: string;
    price_paid: number;
}

/**
 * Defines the structure for subscription status response.
 */
export interface SubscriptionStatusResponse {
    course_id?: string;
    status: string; // Assuming SubscriptionStatus is a string enum
}

/**
 * Defines the structure for sell item subscription response.
 */
export interface SellItemSubscriptionResponse {
    id: string;
    title: string;
    crop: string;
    expiry_date?: Date;
}

/**
 * Defines the structure for farming subscription form data.
 */
export interface FarmingSubscriptionFormData {
    cropName: string;
    price: number;
    duration_days: number;
    thumbnail?: File;
}

/**
 * Defines the structure for updating farming subscription form data.
 */
export interface FarmingSubscriptionUpdateFormData {
    cropName?: string;
    price?: number;
    duration_days?: number;
    thumbnail?: File;
}

/**
 * Defines the structure for farming subscription response.
 */
export interface FarmingSubscriptionResponse {
    id: string;
    cropName: string;
    price: number;
    duration: number;
    thumbnail?: string;
    live: boolean;
}

/**
 * Defines the structure for text content payload.
 */
export interface TextContentPayload {
    content_type: "paragraph" | "bullet1" | "bullet2";
    data: string | string[];
}

/**
 * Defines the structure for user response.
 */
export interface UserResponse extends User {
    subscriptionStatus?: string;
}

/**
 * Provides services related to farming subscriptions.
 */
export class FarmingSubscriptionService {
    /**
     * Get all farming subscriptions.
     * @returns {Promise<any[] | null>} A list of all farming subscriptions or null if an error occurs.
     */
    public static async getAllFarmingSubscriptions(): Promise<any[] | null> {
        try {
            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/list`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to get farming subscriptions: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to get farming subscriptions: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while fetching farming subscriptions.');
            console.error("Error in FarmingSubscriptionService.getAllFarmingSubscriptions:", error);
            return null;
        }
    }

    /**
     * Get farming subscriptions for a specific user.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<FarmingSubscriptionResponse[] | null>} A list of farming subscriptions for the user or null if an error occurs.
     */
    public static async getFarmingSubscriptionsForUser(userId: string): Promise<FarmingSubscriptionResponse[] | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/list/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Token-Source": "password",
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to get user farming subscriptions: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to get user farming subscriptions: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json() as FarmingSubscriptionResponse[];
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while fetching user farming subscriptions.');
            console.error("Error in FarmingSubscriptionService.getFarmingSubscriptionsForUser:", error);
            return null;
        }
    }

    /**
     * Get farming subscription details by course ID.
     * @param {string} courseId - The ID of the course.
     * @returns {Promise<any | null>} The farming subscription details or null if an error occurs.
     */
    public static async getFarmingSubscriptionDetails(courseId: string): Promise<any | null> {
        try {
            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/${courseId}/details`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to get farming subscription details: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to get farming subscription details: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while fetching farming subscription details.');
            console.error("Error in FarmingSubscriptionService.getFarmingSubscriptionDetails:", error);
            return null;
        }
    }

    /**
     * Create a new farming subscription.
     * @param {FarmingSubscriptionFormData} data - The subscription creation data.
     * @returns {Promise<any | null>} The created farming subscription or null if an error occurs.
     */
    public static async createFarmingSubscription(data: FarmingSubscriptionFormData): Promise<any | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const formData = new FormData();
            formData.append('cropName', data.cropName);
            formData.append('price', data.price.toString());
            formData.append('duration_days', data.duration_days.toString());
            if (data.thumbnail) {
                formData.append('thumbnail', data.thumbnail);
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/create`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to create farming subscription: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to create farming subscription: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while creating the farming subscription.');
            console.error("Error in FarmingSubscriptionService.createFarmingSubscription:", error);
            return null;
        }
    }

    /**
     * Add text content to a farming subscription.
     * @param {string} courseId - The ID of the course.
     * @param {TextContentPayload[]} content - The text content to add.
     * @returns {Promise<any | null>} The response or null if an error occurs.
     */
    public static async addFarmingSubscriptionTextContent(courseId: string, content: TextContentPayload[]): Promise<any | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/${courseId}/content/text`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(content),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to add text content: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to add text content: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while adding text content.');
            console.error("Error in FarmingSubscriptionService.addFarmingSubscriptionTextContent:", error);
            return null;
        }
    }

    /**
     * Add image content to a farming subscription.
     * @param {string} courseId - The ID of the course.
     * @param {FormData} formData - The form data containing the image.
     * @returns {Promise<any | null>} The response with image ID or null if an error occurs.
     */
    public static async addFarmingSubscriptionImageContent(courseId: string, formData: FormData): Promise<any | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/${courseId}/content/image`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to add image content: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to add image content: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while adding image content.');
            console.error("Error in FarmingSubscriptionService.addFarmingSubscriptionImageContent:", error);
            return null;
        }
    }


    /**
     * Order farming subscription content by IDs.
     * @param {string} courseId - The ID of the course.
     * @param {string[]} ids - The array of content IDs in the desired order.
     * @returns {Promise<any | null>} The response or null if an error occurs.
     */
    public static async orderFarmingSubscriptionContent(courseId: string, ids: string[]): Promise<any | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/${courseId}/content/order`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ids }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to order content: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to order content: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while ordering content.');
            console.error("Error in FarmingSubscriptionService.orderFarmingSubscriptionContent:", error);
            return null;
        }
    }

    /**
     * Make a farming subscription live.
     * @param {string} courseId - The ID of the course.
     * @returns {Promise<any | null>} The response or null if an error occurs.
     */
    public static async makeFarmingSubscriptionLive(courseId: string): Promise<any | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/${courseId}/live`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to make subscription live: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to make subscription live: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while making the subscription live.');
            console.error("Error in FarmingSubscriptionService.makeFarmingSubscriptionLive:", error);
            return null;
        }
    }

    /**
     * Take a farming subscription down (offline).
     * @param {string} courseId - The ID of the course.
     * @returns {Promise<any | null>} The response or null if an error occurs.
     */
    public static async takeFarmingSubscriptionDown(courseId: string): Promise<any | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/${courseId}/down`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to take subscription down: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to take subscription down: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while taking the subscription down.');
            console.error("Error in FarmingSubscriptionService.takeFarmingSubscriptionDown:", error);
            return null;
        }
    }

    /**
     * Update farming subscription details.
     * @param {string} courseId - The ID of the course.
     * @param {FarmingSubscriptionUpdateFormData} data - The updated subscription data.
     * @returns {Promise<any | null>} The response or null if an error occurs.
     */
    public static async updateFarmingSubscription(courseId: string, data: FarmingSubscriptionUpdateFormData): Promise<any | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const formData = new FormData();
            if (data.cropName !== undefined) {
                formData.append('cropName', data.cropName);
            }
            if (data.price !== undefined) {
                formData.append('price', data.price.toString());
            }
            if (data.duration_days !== undefined) {
                formData.append('duration_days', data.duration_days.toString());
            }
            if (data.thumbnail) {
                formData.append('thumbnail', data.thumbnail);
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/${courseId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to update farming subscription: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to update farming subscription: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while updating the farming subscription.');
            console.error("Error in FarmingSubscriptionService.updateFarmingSubscription:", error);
            return null;
        }
    }

    /**
     * Create an offline farming subscription for a user.
     * @param {string} userId - The ID of the user.
     * @param {SubscriptionOfflineCreate} data - The subscription creation data.
     * @returns {Promise<any | null>} The response or null if an error occurs.
     */
    public static async createOfflineFarmingSubscription(userId: string, data: SubscriptionOfflineCreate): Promise<any | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/offline/create?user_id=${encodeURIComponent(userId)}`, {
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
                const errorMessage = errorData.detail || `Failed to create offline subscription: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to create offline subscription: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while creating the offline subscription.');
            console.error("Error in FarmingSubscriptionService.createOfflineFarmingSubscription:", error);
            return null;
        }
    }

    /**
     * Fetch users with farming subscriptions for a specific course.
     * @param {string} courseId - The ID of the course.
     * @returns {Promise<UserResponse[] | null>} A list of users or null if an error occurs.
     */
    public static async fetchUsersFarmingSubscriptions(courseId: string): Promise<UserResponse[] | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/users/${courseId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to fetch users: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to fetch users: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json() as UserResponse[];
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while fetching users.');
            console.error("Error in FarmingSubscriptionService.fetchUsersFarmingSubscriptions:", error);
            return null;
        }
    }
}