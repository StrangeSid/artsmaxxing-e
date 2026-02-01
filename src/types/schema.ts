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
  creativityStreak: number; // Days active
  lastActiveAt?: Timestamp;
  createdAt: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  slug: string; // e.g., 'visual-arts', 'music'
  description?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName?: string | null; // Null if anonymous
  title: string;
  description: string;
  fileUrl: string;
  fileType: "image" | "audio" | "pdf";
  thumbnailUrl?: string; // For PDFs or Audio covers
  categoryId: string;
  categoryName: string;
  visibility: Visibility;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // No comments or likes fields
}

export interface Feedback {
  id: string;
  postId: string;
  authorId: string; // The teacher or peer giving feedback
  authorRole: "student" | "teacher";
  content: {
    compliment: string; // "What worked well..."
    suggestion: string; // "Even better if..."
  };
  isAnonymous: boolean; // If true, hide authorName in UI
  createdAt: Timestamp;
}
