export type FarmingContentType = "paragraph" | "bullet1" | "bullet2" | "image";

export interface FarmingContentItem {
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

export interface FarmingCourseDetails {
  id: string;
  cropName: string;
  price: number;
  duration_days: number;
  live: boolean;
  thumbnail?: string;
  content: FarmingContentItem[];
}

export interface UploadableFile {
  uri: string;
  name: string;
  type: string;
}

export interface FarmingCourseFormValues {
  cropName: string;
  price: number;
  duration_days: number;
  thumbnailFile?: UploadableFile;
}
