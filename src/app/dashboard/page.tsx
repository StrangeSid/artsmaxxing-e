"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getUserPosts } from "@/lib/db";
import { Post } from "@/types";
import PostCard from "@/components/PostCard";
import Link from "next/link";

export default function DashboardPage() {
    const { user, profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
            return;
        }

        const fetchUserPosts = async () => {
            if (user?.uid) {
                try {
                    const userPosts = await getUserPosts(user.uid);
                    setPosts(userPosts);
                } catch (error) {
                    console.error("Error fetching posts:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        if (user) {
            fetchUserPosts();
        }
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const publicPosts = posts.filter(p => p.visibility !== 'private');
    const privatePosts = posts.filter(p => p.visibility === 'private');

    return (
        <div className="container mx-auto px-6 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-2xl font-bold">
                        {user.displayName?.[0] || "U"}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--foreground)]">My Creative Space</h1>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                </div>

                <Link
                    href="/upload"
                    className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-3 rounded-lg hover:bg-[var(--primary-hover)] transition-colors shadow-sm font-medium"
                >
                    <span>+</span> New Creation
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        ⚡ Creative Streak
                    </h2>
                    <p className="text-3xl font-bold text-[var(--foreground)]">
                        {profile?.creativityStreak || 0} <span className="text-base font-normal text-gray-400">days</span>
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Public Works
                    </h2>
                    <p className="text-3xl font-bold text-[var(--foreground)]">
                        {publicPosts.length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        🔒 Private Archive
                    </h2>
                    <p className="text-3xl font-bold text-[var(--foreground)]">
                        {privatePosts.length}
                    </p>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="mb-6 border-b border-[var(--border)]">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('public')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'public'
                                ? 'text-[var(--primary)]'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Shared with Community
                        {activeTab === 'public' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)] rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('private')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'private'
                                ? 'text-[var(--primary)]'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Private Archive
                        {activeTab === 'private' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)] rounded-t-full" />
                        )}
                    </button>
                </div>
            </div>

            {/* Post Grid */}
            <div className="min-h-[300px]">
                {activeTab === 'public' ? (
                    publicPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {publicPosts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-[var(--border)]">
                            <p className="text-gray-500 mb-4">You haven&apos;t shared anything publicly yet.</p>
                            <Link href="/upload" className="text-[var(--primary)] hover:underline font-medium">
                                Share your first work
                            </Link>
                        </div>
                    )
                ) : (
                    privatePosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {privatePosts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-[var(--border)]">
                            <p className="text-gray-500 mb-4">Your private archive is empty.</p>
                            <Link href="/upload" className="text-[var(--primary)] hover:underline font-medium">
                                Save a draft or private work
                            </Link>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
