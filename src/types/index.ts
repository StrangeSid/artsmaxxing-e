export type Visibility = 'private' | 'anonymous' | 'public';

export type Category = 'Art' | 'Writing' | 'Photography' | 'Music' | 'Design';

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    gradeLevel?: string;
    creativityStreak: number;
    createdAt: number; // Timestamp
}

export interface Post {
    id: string;
    authorId: string;
    authorName?: string; // Optional, only if public visibility
    authorPhotoURL?: string; // Optional, linked to user profile
    title: string;
    description?: string;
    fileUrl: string;
    fileType: 'image' | 'video' | 'audio' | 'pdf' | 'other';
    category: Category;
    visibility: Visibility;
    createdAt: number;
    likes?: never; // Explicitly disallowed
    views: number;
}

export interface Feedback {
    id: string;
    postId: string;
    content: {
        compliment: string;
        suggestion: string;
    };
    authorId?: string; // Optional/Hidden based on anonymity preferences
    createdAt: number;
    isTeacherFeedback: boolean;
}
