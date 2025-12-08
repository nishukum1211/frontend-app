import { getLoginJwtToken } from "../auth/auth";
import { AppConfig } from "../config";

/**
 * Defines the structure for creating an offline subscription.
 */
export interface SubscriptionCreate {
    course_id: string;
    order_id: string;
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
                throw new Error(`Failed to create offline subscription: ${response.status} ${response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error("Error in SubscriptionService.createOfflineSubscription:", error);
            return false;
        }
    }
}
