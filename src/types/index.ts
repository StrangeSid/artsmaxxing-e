export type Visibility = 'private' | 'anonymous' | 'public';

export type Category = 'Art' | 'Writing' | 'Photography' | 'Music' | 'Design';

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    gradeLevel?: string;
    creativityStreak: number;
    createdAt: number;
}

export interface Post {
    id: string;
    authorId: string;
    authorName?: string;
    authorPhotoURL?: string;
    title: string;
    description?: string;
    fileUrl: string;
    fileType: 'image' | 'video' | 'audio' | 'pdf' | 'other';
    category: Category;
    visibility: Visibility;
    createdAt: number;
    likes?: never;
    views: number;
}

export interface Feedback {
    id: string;
    postId: string;
    content: {
        compliment: string;
        suggestion: string;
    };
    authorId?: string;
    createdAt: number;
    isTeacherFeedback: boolean;
}
