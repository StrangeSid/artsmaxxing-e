import { Timestamp } from "firebase/firestore";

export type GradeLevel = "6" | "7" | "8" | "9" | "10";
export type Visibility = "private" | "anonymous" | "public_with_name";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  gradeLevel?: GradeLevel;
  role: "student" | "teacher" | "admin";
  creativityStreak: number;
  lastActiveAt?: Timestamp;
  createdAt: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName?: string | null;
  title: string;
  description: string;
  fileUrl: string;
  fileType: "image" | "audio" | "pdf";
  thumbnailUrl?: string;
  categoryId: string;
  categoryName: string;
  visibility: Visibility;
  createdAt: Timestamp;
  updatedAt: Timestamp;

}

export interface Feedback {
  id: string;
  postId: string;
  authorId: string;
  authorRole: "student" | "teacher";
  content: {
    compliment: string;
    suggestion: string;
  };
  isAnonymous: boolean;
  createdAt: Timestamp;
}
