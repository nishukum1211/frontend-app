import { Alert } from "react-native";
import { getLoginJwtToken } from "../auth/auth";
import { AppConfig } from "../config";
import { User } from "./user";

export type FarmingContentType = "paragraph" | "bullet1" | "bullet2" | "image";

export interface FarmingCourseContentItem {
    id: string;
    content_type: FarmingContentType;
    data: string | string[];
}

export interface FarmingCourseListItem {
    id: string;
    cropName: string;
    thumbnail?: string;
    live?: boolean;
    price?: number | string;
    duration_days?: number;
}

export interface FarmingCourseDetailsResponse {
    id: string;
    cropName: string;
    price: number;
    duration_days: number;
    live: boolean;
    thumbnail?: string;
    content: FarmingCourseContentItem[];
}

/**
 * Defines the structure for creating a farming course.
 */
export interface FarmingCourseCreate {
    course_id: string;
    order_id: string;
}

/**
 * Defines the structure for offline farming course creation.
 */
export interface FarmingCourseOfflineCreate {
    course_id: string;
    order_id: string;
    price_paid: number;
}

/**
 * Defines the structure for farming course status response.
 */
export interface FarmingCourseStatusResponse {
    course_id?: string;
    status: string; // Assuming FarmingCourseStatus is a string enum
}

/**
 * Defines the structure for sell item farming course response.
 */
export interface SellItemFarmingCourseResponse {
    id: string;
    title: string;
    crop: string;
    expiry_date?: Date;
}

/**
 * Defines the structure for farming course form data.
 */
export interface FarmingCourseFormData {
    cropName: string;
    price: number;
    duration_days: number;
    thumbnail?: File;
}

/**
 * Defines the structure for updating farming course form data.
 */
export interface FarmingCourseUpdateFormData {
    cropName?: string;
    price?: number;
    duration_days?: number;
    thumbnail?: File;
}

/**
 * Defines the structure for farming course response.
 */
export interface FarmingCourseResponse {
    id: string;
    cropName: string;
    price: number;
    duration: number;
    thumbnail?: string;
    live: boolean;
}

/**
 * Defines the structure for farming subscription response.
 */
export interface FarmingSubscriptionResponse {
    id: string;
    cropName: string;
    thumbnail?: string;
    active: boolean;
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
    farmingCourseStatus?: string;
}

/**
 * Provides services related to farming courses.
 */
export class FarmingCourseService {
    /**
     * Get all farming courses.
     * @returns {Promise<any[] | null>} A list of all farming courses or null if an error occurs.
     */
    public static async getAllFarmingCourses(): Promise<FarmingCourseListItem[] | null> {
        try {
            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/list`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to get farming courses: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to get farming courses: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json() as FarmingCourseListItem[];
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while fetching farming courses.');
            console.error("Error in FarmingCourseService.getAllFarmingCourses:", error);
            return null;
        }
    }

    /**
     * Get farming subscriptions with optional user authentication.
     * When authenticated, subscriptions are enriched with the user's active status.
     * When not authenticated, all live subscriptions are returned with active=false.
     * @returns {Promise<FarmingSubscriptionResponse[] | null>} A list of farming subscriptions or null if an error occurs.
     */
    public static async getFarmingSubscriptionsForUser(): Promise<FarmingSubscriptionResponse[] | null> {
        try {
            const token = await getLoginJwtToken();

            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
                headers['X-Token-Source'] = 'password';
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/list/user`, {
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to get farming subscriptions: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to get farming subscriptions: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json() as FarmingSubscriptionResponse[];
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while fetching farming subscriptions.');
            console.error("Error in FarmingCourseService.getFarmingSubscriptionsForUser:", error);
            return null;
        }
    }

    /**
     * Get farming course details by course ID.
     * @param {string} courseId - The ID of the course.
     * @returns {Promise<any | null>} The farming course details or null if an error occurs.
     */
    public static async getFarmingCourseDetails(courseId: string): Promise<FarmingCourseDetailsResponse | null> {
        try {
            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/details/${courseId}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to get farming course details: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to get farming course details: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json() as FarmingCourseDetailsResponse;
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while fetching farming course details.');
            console.error("Error in FarmingCourseService.getFarmingCourseDetails:", error);
            return null;
        }
    }

    /**
     * Create a new farming course.
     * @param {FarmingCourseFormData} data - The farming course creation data.
     * @returns {Promise<any | null>} The created farming course or null if an error occurs.
     */
    public static async createFarmingCourse(data: FarmingCourseFormData): Promise<any | null> {
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
                const errorMessage = errorData.detail || `Failed to create farming course: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to create farming course: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while creating the farming course.');
            console.error("Error in FarmingCourseService.createFarmingCourse:", error);
            return null;
        }
    }

    /**
     * Add text content to a farming course.
     * @param {string} courseId - The ID of the course.
     * @param {TextContentPayload[]} content - The text content to add.
     * @returns {Promise<any | null>} The response or null if an error occurs.
     */
    public static async addFarmingCourseTextContent(courseId: string, content: TextContentPayload[]): Promise<FarmingCourseContentItem[] | null> {
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

            return await response.json() as FarmingCourseContentItem[];
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while adding text content.');
            console.error("Error in FarmingCourseService.addFarmingCourseTextContent:", error);
            return null;
        }
    }

    /**
     * Add image content to a farming course.
     * @param {string} courseId - The ID of the course.
     * @param {FormData} formData - The form data containing the image.
     * @returns {Promise<any | null>} The response with image ID or null if an error occurs.
     */
    public static async addFarmingCourseImageContent(courseId: string, formData: FormData): Promise<FarmingCourseContentItem[] | null> {
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

            return await response.json() as FarmingCourseContentItem[];
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while adding image content.');
            console.error("Error in FarmingCourseService.addFarmingCourseImageContent:", error);
            return null;
        }
    }


    /**
     * Reorder and update all farming course content.
     * @param {string} courseId - The ID of the course.
    * @param {FarmingCourseContentItem[]} content - The list of content items.
     * @returns {Promise<any | null>} The response or null if an error occurs.
     */
    public static async orderFarmingCourseContent(courseId: string, content: FarmingCourseContentItem[]): Promise<any | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/${courseId}/content`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(content),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to update content: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to update content: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while updating content.');
            console.error("Error in FarmingCourseService.orderFarmingCourseContent:", error);
            return null;
        }
    }

    /**
     * Make a farming course live.
     * @param {string} courseId - The ID of the course.
     * @returns {Promise<any | null>} The response or null if an error occurs.
     */
    public static async makeFarmingCourseLive(courseId: string): Promise<any | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/${courseId}/live`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to make farming course live: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to make farming course live: ${response.status} ${response.statusText}`);
                return null;
            }

            return true;
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while making the farming course live.');
            console.error("Error in FarmingCourseService.makeFarmingCourseLive:", error);
            return null;
        }
    }

    /**
     * Take a farming course down (offline).
     * @param {string} courseId - The ID of the course.
     * @returns {Promise<any | null>} The response or null if an error occurs.
     */
    public static async takeFarmingCourseDown(courseId: string): Promise<any | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/farming/${courseId}/down`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `Failed to take farming course down: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to take farming course down: ${response.status} ${response.statusText}`);
                return null;
            }

            return true;
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while taking the farming course down.');
            console.error("Error in FarmingCourseService.takeFarmingCourseDown:", error);
            return null;
        }
    }

    /**
     * Update farming course details.
     * @param {string} courseId - The ID of the course.
     * @param {FarmingCourseUpdateFormData} data - The updated farming course data.
     * @returns {Promise<any | null>} The response or null if an error occurs.
     */
    public static async updateFarmingCourse(courseId: string, data: FarmingCourseUpdateFormData): Promise<any | null> {
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
                const errorMessage = errorData.detail || `Failed to update farming course: ${response.status} ${response.statusText}`;
                Alert.alert('Error', errorMessage);
                console.error(`Failed to update farming course: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while updating the farming course.');
            console.error("Error in FarmingCourseService.updateFarmingCourse:", error);
            return null;
        }
    }

    /**
     * Create an offline farming course for a user.
     * @param {string} userId - The ID of the user.
     * @param {FarmingCourseOfflineCreate} data - The farming course creation data.
     * @returns {Promise<any | null>} The response or null if an error occurs.
     */
    public static async createOfflineFarmingCourse(userId: string, data: FarmingCourseOfflineCreate): Promise<any | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again.");
                console.error("Authentication error. Please log in again.");
                return null;
            }

            console.log("Creating offline farming course:", { userId, data });
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
                const errorMessage = errorData.detail || `Failed to create offline farming course: ${response.status} ${response.statusText}`;
                Alert.alert('Error', typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
                console.error(`Failed to create offline farming course: ${response.status}`, JSON.stringify(errorData));
                return null;
            }

            return await response.json();
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while creating the offline farming course.');
            console.error("Error in FarmingCourseService.createOfflineFarmingCourse:", error);
            return null;
        }
    }

    /**
     * Fetch users with farming courses for a specific course.
     * @param {string} courseId - The ID of the course.
     * @returns {Promise<UserResponse[] | null>} A list of users or null if an error occurs.
     */
    public static async fetchUsersFarmingCourses(courseId: string): Promise<UserResponse[] | null> {
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
            console.error("Error in FarmingCourseService.fetchUsersFarmingCourses:", error);
            return null;
        }
    }
}