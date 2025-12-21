import { Directory, File, Paths } from 'expo-file-system';
import { getLoginJwtToken } from "../auth/auth";
import { AppConfig } from "../config";

/**
 * Defines the structure for content item information within a course.
 * The structure is inferred from backend usage, assuming it has 'title' and 'desc'.
 */
export interface ItemInfo {
    id: string;
    content_type: string;
    data: string;
}

/**
 * Defines the structure for a course object.
 * This corresponds to the CourseItemDB from the backend.
 */
export interface Course {
    id: string;
    title: string;
    crop: string;
    content: ItemInfo[];
    price: number;
    live: boolean;
}

/**
 * Defines the structure for the course update payload.
 */
export interface CourseUpdatePayload {
    title: string;
    crop: string;
    content: ItemInfo[];
    price: number;
}

/**
 * Represents a file to be uploaded.
 */
export interface FileUpload {
    uri: string;
    name: string;
    type: string;
}

/**
 * Provides services related to course data.
 */
export class CourseService {
    /**
     * Creates a new course.
     * @param {FormData} formData - The course data to create, including files.
     * @returns {Promise<boolean>} True if the course was created successfully, false otherwise.
     */
    public static async addCourse(formData: FormData): Promise<Course | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/course/add`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // 'Content-Type' is set automatically by the browser for multipart/form-data
                },
                body: formData,
            });

            if (!response.ok) {
                console.error(`Failed to add course: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json() as Course;
        } catch (error) {
            console.error("Error in CourseService.addCourse:", error);
            return null;
        }
    }

    /**
     * Fetches a list of all available courses.
     * @returns {Promise<Course[] | null>} A list of courses or null if an error occurs.
     */
    public static async listCourses(): Promise<Course[] | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/course/list`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error(`Failed to list courses: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json() as Course[];
        } catch (error) {
            console.error("Error in CourseService.listCourses:", error);
            return null;
        }
    }

    /**
     * Fetches a single course by its ID.
     * @param {string} courseId - The ID of the course to fetch.
     * @returns {Promise<Course | null>} The course object or null if not found.
     */
    public static async getCourse(courseId: string): Promise<Course | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/course/content/${courseId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error(`Failed to get course: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json() as Course;
        } catch (error) {
            console.error("Error in CourseService.getCourse:", error);
            return null;
        }
    }

    /**
     * Sets a course to be live.
     * @param {string} courseId - The ID of the course to set as live.
     * @returns {Promise<boolean>} True if the operation was successful, false otherwise.
     */
    public static async goLive(courseId: string): Promise<boolean> {
        return CourseService.updateLiveStatus(courseId, "live");
    }

    /**
     * Takes a course down (makes it not live).
     * @param {string} courseId - The ID of the course to take down.
     * @returns {Promise<boolean>} True if the operation was successful, false otherwise.
     */
    public static async goDown(courseId: string): Promise<boolean> {
        return CourseService.updateLiveStatus(courseId, "down");
    }

    private static async updateLiveStatus(courseId: string, status: "live" | "down"): Promise<boolean> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                console.error("Authentication error. Please log in again.");
                return false;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/course/${status}/${courseId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error(`Failed to update live status to ${status}: ${response.status} ${response.statusText}`);
                return false;
            }
            return true;
        } catch (error) {
            console.error(`Error in CourseService.updateLiveStatus (${status}):`, error);
            return false;
        }
    }

    /**
     * Updates an entire course's content.
     * @param {string} courseId - The ID of the course to update.
     * @param {CourseUpdatePayload} data - The new data for the course.
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    public static async updateCourse(courseId: string, data: CourseUpdatePayload): Promise<boolean> {
        try {
            console.log(data);
            const token = await getLoginJwtToken();
            if (!token) {
                console.error("Authentication error. Please log in again.");
                return false;
            }

            const response = await fetch(`${AppConfig.API_BASE_URL}/course/content/${courseId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                console.error(`Failed to update course: ${response.status} ${response.statusText}`);
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error in CourseService.updateCourse:", error);
            return false;
        }
    }
    /**
     * Uploads a photo for a specific course.
     * @param {string} courseId - The ID of the course to add the photo to.
     * @param {FileUpload} image - The image file to upload.
     * @returns {Promise<boolean>} True if the upload was successful, false otherwise.
     */
    public static async addPhoto(courseId: string, image: FileUpload): Promise<string | null> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                console.error("Authentication error. Please log in again.");
                return null;
            }

            const formData = new FormData();
            // The backend expects the file in a field named 'image'.
            formData.append('image', { uri: image.uri, name: image.name, type: image.type } as any);

            const response = await fetch(`${AppConfig.API_BASE_URL}/course/photo/${courseId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // 'Content-Type' is set automatically by the browser for multipart/form-data
                },
                body: formData,
            });

            if (!response.ok) {
                console.error(`Failed to add photo: ${response.status} ${response.statusText}`);
                return null;
            }

            const res = await response.json();
            return null;
        } catch (error) {
            console.error("Error in CourseService.addPhoto:", error);
            return null;
        }
    }

    /**
     * Updates the PDF for a specific course.
     * @param {string} courseId - The ID of the course to update the PDF for.
     * @param {FileUpload} pdf - The PDF file to upload.
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    public static async updatePdf(courseId: string, pdf: FileUpload): Promise<boolean> {
        try {
            const token = await getLoginJwtToken();
            if (!token) {
                console.error("Authentication error. Please log in again.");
                return false;
            }

            const formData = new FormData();
            // The backend expects the file in a field named 'pdf'.
            formData.append('pdf', { uri: pdf.uri, name: pdf.name, type: pdf.type } as any);

            const response = await fetch(`${AppConfig.API_BASE_URL}/course/pdf/${courseId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // 'Content-Type' is set automatically by the browser for multipart/form-data
                },
                body: formData,
            });

            return response.ok;
        } catch (error) {
            console.error("Error in CourseService.updatePdf:", error);
            return false;
        }
    }

    /**
     * Constructs the URL for a course's thumbnail image.
     * This method will download the file if it's not already cached locally.
     * @param {string} courseId - The ID of the course.
     * @returns {Promise<string | null>} The local URI of the thumbnail image, or null if an error occurs.
     */
    public static async getCourseThumbnailUrl(courseId: string): Promise<string | null> {
        return CourseService.getCourseFileUrl(courseId, "thumbnail.jpeg");
    }

    /**
     * Constructs the URL for a course's PDF file.
     * This method will download the file if it's not already cached locally.
     * @param {string} courseId - The ID of the course.
     * @returns {Promise<string | null>} The local URI of the PDF file, or null if an error occurs.
     */
    public static async getCoursePdfUrl(courseId: string): Promise<string | null> {
        return CourseService.getCourseFileUrl(courseId, "data.pdf");
    }

    /**
     * Downloads a file associated with a course to the local device if it doesn't already exist,
     * and returns the local URI.
     * @param {string} courseId - The ID of the course.
     * @param {string} fileName - The name of the file to retrieve.
     * @returns {Promise<string | null>} The local URI of the file, or null if an error occurs.
     */
    public static async getCourseFileUrl(courseId: string, fileName: string): Promise<string | null> {
        if (!Paths.document) {
            console.error("File system document directory is not available.");
            return null;
        }
        const remoteUrl = `${AppConfig.API_BASE_URL}/course/file/${courseId}/${fileName}`;
        const courseDir = new Directory(Paths.document, courseId);
        const localFile = new File(courseDir, fileName);

        try {
            if (!courseDir.exists) {
                courseDir.create();
            }
            const fileInfo = await localFile.info();
            if (fileInfo.exists) {
                console.log(`File ${fileName} already exists locally.`);
                return localFile.uri;
            }

            const token = await getLoginJwtToken();
            if (!token) {
                console.error("Authentication error. Please log in again.");
                return null;
            }

            console.log(`Downloading file ${fileName} from ${remoteUrl} to ${localFile.uri}`);
            // The new API for downloading doesn't return status, but throws on non-2xx responses.
            const downloadedFile = await File.downloadFileAsync(remoteUrl, localFile, { headers: { Authorization: `Bearer ${token}` } });
            const downloadedFileInfo = await downloadedFile.info();
            if (!downloadedFileInfo.exists) {
                throw new Error(`Failed to download file: ${fileName}`);
            }
            return downloadedFile.uri;
        } catch (error) {
            console.error(`Failed to download or access file ${fileName}:`, error);
            return null;
        }
    }
}
