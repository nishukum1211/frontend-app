import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig } from '../Config';
import { getLoginJwtToken } from '../auth/auth';

/**
 * Defines the structure of a subscription item received from the API.
 */
export interface Subscription {
    id: string;
    name: string;
    crops: string;
    desc: string;
    desc_hn: string;
    expiry_date: string; // ISO 8601 date string
}

export class CourseService {
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
        try {
            const storageKey = `${AppConfig.STORAGE_KEYS.COURSE_PDF_PREFIX}${id}`;
            const cachedUri = await AsyncStorage.getItem(storageKey);

            if (cachedUri) {
                // const file = new File(cachedUri);
                // const info = await file.info();
                if (!forceRefresh) {
                    console.log(`Loaded cached PDF for ID ${id}.`);
                    return cachedUri;
                }
            }

            const token = await getLoginJwtToken();
            if (!token) {
                throw new Error('No auth token found for fetching PDF.');
            }

            const remoteUrl = `${AppConfig.API_BASE_URL}/agent/sell/item/${id}`;
            // const localFilename = `pdf-${id}.pdf`;
            // const localFile = new File(Paths.cache, localFilename);

            // // ✅ Delete existing file if forceRefresh or file already exists
            // const fileInfo = await localFile.info();
            // if (fileInfo.exists) {
            //     console.log('Deleting old PDF before download...');
            //     await localFile.delete();
            // }

            // // Download & write to local file
            // const downloadResult = await File.downloadFileAsync(remoteUrl, localFile);
            // if (!downloadResult.exists) {
            //     throw new Error(`Failed to download PDF for ID ${id}`);
            // }

            // const localUri = downloadResult.uri;
            // await AsyncStorage.setItem(storageKey, localUri);
            // console.log(`Downloaded PDF for ID ${id} and saved at ${localUri}`);
            await AsyncStorage.setItem(storageKey, remoteUrl);
            console.log(`Downloaded PDF for ID ${id} and saved at ${remoteUrl}`);
            return remoteUrl;

        } catch (err) {
            console.error(`Error in getPdfFromStorage(${id}):`, err);
            return null;
        }
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
                    "X-Token-Source": "firebase"
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
        try {
            const storageKey = `${AppConfig.STORAGE_KEYS.COURSE_THUMBNAIL_PREFIX}${id}`;
            const base64Image = await AsyncStorage.getItem(storageKey);

            if (base64Image && !forceRefresh) {
                console.log(`Thumbnail for ID ${id} loaded from AsyncStorage.`);
                return `data:image/jpeg;base64,${base64Image}`;
            }

            console.log(`Fetching thumbnail for ID ${id} from API. Reason: ${forceRefresh ? 'force-refresh' : 'not in storage'}`);
            const imageUrl = `${AppConfig.API_BASE_URL}/agent/sell/item/photo/${id}`;
            const token = await getLoginJwtToken();
            if (!token) {
                throw new Error("No auth token found for fetching thumbnail.");
            }
            const imageResponse = await fetch(imageUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Token-Source": "firebase"
                },
            });

            if (!imageResponse.ok) {
                throw new Error(`Failed to download thumbnail for ID ${id}: ${imageResponse.status} ${imageResponse.statusText} - ${await imageResponse.text()}`);
            }

            const imageBlob = await imageResponse.blob();
            const newBase64Image = await this.blobToBase64(imageBlob);
            await AsyncStorage.setItem(storageKey, newBase64Image);
            console.log(`Thumbnail for ID ${id} fetched and saved to AsyncStorage.`);
            return `data:image/jpeg;base64,${newBase64Image}`;
        } catch (error) {
            console.error(`Error retrieving thumbnail for ID ${id}:`, error);
            return null;
        }
    }

    /**
     * Removes the cached PDF and thumbnail for a specific ID from AsyncStorage.
     * @param id The ID of the assets to remove.
     */
    public static async removeAssetsById(id: string): Promise<void> {
        const pdfStorageKey = `${AppConfig.STORAGE_KEYS.COURSE_PDF_PREFIX}${id}`;
        const thumbnailStorageKey = `${AppConfig.STORAGE_KEYS.COURSE_THUMBNAIL_PREFIX}${id}`;

        try {
            await Promise.all([
                AsyncStorage.removeItem(pdfStorageKey),
                AsyncStorage.removeItem(thumbnailStorageKey)
            ]);
            console.log(`Removed assets for ID: ${id}`);
        } catch (error) {
            console.error(`Error removing assets for ID ${id}:`, error);
        }
    }

    /**
     * Removes all cached PDFs, thumbnails, and the subscription list from AsyncStorage.
     */
    public static async removeAllAssets(): Promise<void> {
        try {
            const allKeys = await AsyncStorage.getAllKeys();
            const keysToRemove = allKeys.filter(key =>
                key.startsWith(AppConfig.STORAGE_KEYS.COURSE_PDF_PREFIX) ||
                key.startsWith(AppConfig.STORAGE_KEYS.COURSE_THUMBNAIL_PREFIX) ||
                key === AppConfig.STORAGE_KEYS.SUBSCRIPTIONS_LIST
            );

            if (keysToRemove.length > 0) {
                await AsyncStorage.multiRemove(keysToRemove);
                console.log('Removed all course assets and subscription list.');
            } else {
                console.log('No course assets found to remove.');
            }
        } catch (error) {
            console.error('Error removing all assets:', error);
        }
    }
}