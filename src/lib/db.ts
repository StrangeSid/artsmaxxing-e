import {
    collection,
    doc,
    setDoc,
    getDoc,
    addDoc,
    query,
    where,
    orderBy,
    getDocs
} from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile, Post, Feedback, Category } from "@/types";


export const createUserProfile = async (user: UserProfile) => {
    if (!user.uid) return;
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        await setDoc(userRef, {
            ...user,
            createdAt: Date.now(),
            creativityStreak: 0
        });
    }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
        return snapshot.data() as UserProfile;
    }
    return null;
};


export const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'views'>) => {
    const postsRef = collection(db, "posts");
    const newPost = {
        ...postData,
        createdAt: Date.now(),
        views: 0
    };
    const docRef = await addDoc(postsRef, newPost);
    return docRef.id;
};

export const getPosts = async (category?: Category, onlyAnonymous?: boolean) => {
    const postsRef = collection(db, "posts");
    let q = query(postsRef, orderBy("createdAt", "desc"));

    if (category) {
        q = query(q, where("category", "==", category));
    }

    if (onlyAnonymous) {
        q = query(q, where("visibility", "==", "anonymous"));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
};

export const getPost = async (id: string): Promise<Post | null> => {
    const docRef = doc(db, "posts", id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Post;
    }
    return null;
};

export const getUserPosts = async (authorId: string): Promise<Post[]> => {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, where("authorId", "==", authorId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
};


export const addFeedback = async (feedback: Omit<Feedback, 'id' | 'createdAt'>) => {
    const feedbackRef = collection(db, "feedback");
    await addDoc(feedbackRef, {
        ...feedback,
        createdAt: Date.now()
    });
};

export const getPostFeedback = async (postId: string) => {
    const feedbackRef = collection(db, "feedback");
    const q = query(feedbackRef, where("postId", "==", postId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feedback));
};
