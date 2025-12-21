import AsyncStorage from '@react-native-async-storage/async-storage';
import { CourseService } from '../api/course';
import { getLoginJwtToken } from '../auth/auth';
import { AppConfig } from '../config';
/**
 * Defines the structure of a subscription item received from the API.
 */
export interface Subscription {
    id: string;
    title: string;
    crop: string;
    expiry_date: string; // ISO 8601 date string
}

export class SubscriptionService {
    private static blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    const base64String = reader.result.split(',')[1];
                    resolve(base64String);
                } else {
                    reject(new Error("Failed to convert blob to base64: reader.result is not a string."));
                }
            };
            reader.onerror = (error) => {
                reject(new Error(`FileReader error: ${error}`));
            };
            reader.readAsDataURL(blob);
        });
    }

    public static async syncCourseAssets(forceRefresh = false): Promise<void> {
        try {
            // First, check if a user is logged in by checking for a token.
            const token = await getLoginJwtToken();
            if (!token) {
                console.log("User not logged in. Aborting asset sync.");
                return;
            }

            const subscriptions = await this.getStoredSubscriptions(forceRefresh);
            if (!subscriptions) {
                console.error("Could not retrieve subscriptions to download PDFs.");
                return;
            }
            console.log(`Processing assets for ${subscriptions.length} subscriptions.`);

            for (const subscription of subscriptions) {
                const assetId = subscription.id;
                console.log(`Syncing assets for subscription ID: ${assetId}`);
                await Promise.all([
                    this.getPdfFromStorage(assetId, forceRefresh).catch(pdfError => {
                        console.error(`Failed to sync PDF for ID ${assetId}:`, pdfError);
                    }),
                    this.getThumbnailFromStorage(assetId, forceRefresh).catch(thumbError => {
                        console.error(`Failed to sync thumbnail for ID ${assetId}:`, thumbError);
                    })
                ]);
            }
            console.log("All active asset processing complete.");
        } catch (overallError) {
            console.error("An error occurred during the overall asset syncing process:", overallError);
        }
    }

    public static async getPdfFromStorage(
        id: string,
        forceRefresh = false
    ): Promise<string | null> {
        return CourseService.getCoursePdfUrl(id, forceRefresh);

    }


    public static async getStoredSubscriptions(forceRefresh = false): Promise<Subscription[] | null> {
        try {
            const storedSubscriptions = await AsyncStorage.getItem(AppConfig.STORAGE_KEYS.SUBSCRIPTIONS_LIST);

            if (storedSubscriptions && !forceRefresh) {
                console.log("Subscriptions loaded from AsyncStorage.");
                return JSON.parse(storedSubscriptions) as Subscription[];
            }
            console.log(`Fetching subscriptions from API. Reason: ${forceRefresh ? 'force-refresh' : 'not in storage'}`);

            const token = await getLoginJwtToken();
            if (!token) {
                console.log("No auth token found for fetching subscriptions.");
                return null;
            }
            const response = await fetch(`${AppConfig.API_BASE_URL}/subscription/active`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Token-Source": "password"
                },
            });

            if (!response.ok) {
                const errorBody = await response.text();
                // Throw an error to be caught by the catch block
                throw new Error(`Failed to fetch subscriptions: ${response.status} - ${errorBody}`);
            }

            const subscriptions: Subscription[] = await response.json();
            await AsyncStorage.setItem(AppConfig.STORAGE_KEYS.SUBSCRIPTIONS_LIST, JSON.stringify(subscriptions));
            console.log(`Fetched ${subscriptions.length} subscriptions from API and saved to AsyncStorage.`);
            return subscriptions;
        } catch (error) {
            console.error('Error retrieving subscriptions from AsyncStorage:', error);
            return null;
        }
    }

    public static async getThumbnailFromStorage(id: string, forceRefresh = false): Promise<string | null> {
        return CourseService.getCourseThumbnailUrl(id, forceRefresh);

    }
}