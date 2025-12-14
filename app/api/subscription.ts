import { getLoginJwtToken } from "../auth/auth";
import { AppConfig } from "../config";
import { User } from "./user"; // Import the User interface

/**
 * Defines the structure for creating an offline subscription.
 */
export interface SubscriptionCreate {
    course_id: string;
    order_id: string;
    price_paid: number;
}

/**
 * Defines the structure for a sellable subscription item.
 */
export interface SubscriptionSellableItem {
    id: string;
    name: string;
    crops: string;
    content: string;
    desc: string;
    desc_hn: string;
    price: number;
    active: boolean;
}

/**
 * Provides services related to subscriptions.
 */
export class SubscriptionService {
    /**
     * Creates an offline subscription for a user.
     * @param {SubscriptionCreate} data - The subscription creation data.
     * @param {string} user_id - The ID of the user for whom the subscription is created.
     * @returns {Promise<boolean>} True if the subscription was created successfully, false otherwise.
     */
    public static async createOfflineSubscription(data: SubscriptionCreate, user_id: string): Promise<boolean> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                console.log("No auth token found for creating offline subscription.");
                return false;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/subscription/offline/create?user_id=${user_id}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Token-Source": "password",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                console.log(`Failed to create offline subscription: ${response.status} ${response.statusText}`);
                return false;
            }

            return true;
        } catch (error) {
            console.log("Error in SubscriptionService.createOfflineSubscription:", error);
            return false;
        }
    }

    /**
     * Fetches all users subscribed to a specific course.
     * @param {string} courseId - The ID of the course.
     * @returns {Promise<User[] | null>} A list of User objects or null if an error occurs.
     */
    public static async getUsersSubscribedToCourse(courseId: string): Promise<User[] | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/subscription/course/${encodeURIComponent(courseId)}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Token-Source": "password",
                },
            });
            if (!response.ok) {
                console.log(`Failed to fetch subscribed users: ${response.status} ${response.statusText}`);
                return null;
            }

            const users: User[] = await response.json();
            return users;
        } catch (error) {
            console.log("Error in SubscriptionService.getUsersSubscribedToCourse:", error);
            return null;
        }
    }

    /**
     * Fetches all sellable subscription items.
     * @returns {Promise<SubscriptionSellableItem[] | null>} A list of sellable subscription items or null if an error occurs.
     */
    public static async getSubscriptionSellableItems(): Promise<SubscriptionSellableItem[] | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/subscription/sell/item`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.log(`Failed to fetch subscription sellable items: ${response.status} ${response.statusText}`);
                return null;
            }

            const items = await response.json() as SubscriptionSellableItem[];
            // Sort items: active:false first, then active:true
            items.sort((a, b) => Number(a.active) - Number(b.active));
            return items;
        } catch (error) {
            console.error("Error in SubscriptionService.getSubscriptionSellableItems:", error);
            return null;
        }
    }
}
