"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPost, getPostFeedback, addFeedback } from "@/lib/db";
import { Post, Feedback } from "@/types";

export default function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params);

    const { user } = useAuth();
    const router = useRouter();

    const [post, setPost] = useState<Post | null>(null);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [glow, setGlow] = useState("");
    const [grow, setGrow] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            // If local dev or MVP, we might need to handle this strictly. 
            // But for now, fetch data regardless of auth (read access is public for posts).
            // However, giving feedback requires auth.

            try {
                const fetchedPost = await getPost(id);
                if (!fetchedPost) {
                    // Handle 404
                    return;
                }
                setPost(fetchedPost);

                // Fetch feedback separately to allow partial loads
                try {
                    const fetchedFeedback = await getPostFeedback(id);
                    setFeedbacks(fetchedFeedback);
                } catch (fbError) {
                    console.error("Error fetching feedback:", fbError);
                }

            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !glow.trim() || !grow.trim()) return;

        setSubmitting(true);
        try {
            const newFeedback: Omit<Feedback, 'id' | 'createdAt'> = {
                postId: id,
                content: {
                    compliment: glow,
                    suggestion: grow
                },
                authorId: isAnonymous ? "anonymous" : user.uid,
                isTeacherFeedback: false // Default to peer feedback
            };

            await addFeedback(newFeedback);

            // Optimistic update or refetch
            const updatedFeedback = await getPostFeedback(id);
            setFeedbacks(updatedFeedback);

            // Reset form
            setGlow("");
            setGrow("");
            setSuccessMessage("Feedback shared successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (error) {
            console.error("Error submitting feedback:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-12 text-center">
                <h1 className="text-2xl font-bold text-gray-800">Post not found</h1>
                <button onClick={() => router.push("/")} className="mt-4 text-[var(--primary)] hover:underline">
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Post Preview */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden shadow-sm">
                        <div className="relative aspect-[4/3] bg-gray-100 border-b border-[var(--border)]">
                            {post.fileType === 'image' ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={post.fileUrl}
                                    alt={post.title}
                                    className="w-full h-full object-contain bg-gray-50"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span className="uppercase tracking-wider font-medium">{post.fileType}</span>
                                </div>
                            )}
                        </div>
                        <div className="p-6">
                            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">{post.title}</h1>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs uppercase font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                    {post.category}
                                </span>
                                <span className="text-sm text-gray-500">
                                    by {post.visibility === 'anonymous' ? 'Anonymous' : (post.authorName || 'Student')}
                                </span>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                {post.description || "No description provided."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Feedback Interface */}
                <div className="space-y-8">
                    {/* Write Feedback Section - Only if logged in */}
                    {user ? (
                        <div className="bg-white rounded-lg border border-[var(--border)] p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">Give Feedback</h2>
                            <p className="text-sm text-gray-500 mb-6">Help this artist grow with kind and specific feedback.</p>

                            {successMessage && (
                                <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200">
                                    {successMessage}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        ✨ What Glows? <span className="text-gray-400 font-normal">(Compliments)</span>
                                    </label>
                                    <textarea
                                        value={glow}
                                        onChange={(e) => setGlow(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none min-h-[100px] text-sm"
                                        placeholder="What do you love about this piece? Be specific!"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        🌱 What Grows? <span className="text-gray-400 font-normal">(Suggestions)</span>
                                    </label>
                                    <textarea
                                        value={grow}
                                        onChange={(e) => setGrow(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none min-h-[100px] text-sm"
                                        placeholder="How could this represent the idea even better?"
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 select-none">
                                        <input
                                            type="checkbox"
                                            checked={isAnonymous}
                                            onChange={(e) => setIsAnonymous(e.target.checked)}
                                            className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                                        />
                                        <span>Give feedback anonymously</span>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={submitting || !glow || !grow}
                                        className="px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-lg transition-colors disabled:opacity-50 text-sm"
                                    >
                                        {submitting ? 'Sharing...' : 'Share Feedback'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg border border-[var(--border)] p-8 text-center">
                            <p className="text-gray-600 mb-4">Sign in to leave feedback for this artist.</p>
                            <button
                                onClick={() => router.push('/login')}
                                className="px-6 py-2.5 bg-white border border-[var(--border)] hover:border-[var(--primary)] text-[var(--primary)] font-medium rounded-lg transition-colors text-sm"
                            >
                                Log In
                            </button>
                        </div>
                    )}

                    {/* Read Feedback Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-[var(--foreground)] px-1">Community Feedback ({feedbacks.length})</h3>

                        {feedbacks.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 italic bg-white rounded-lg border border-dashed border-[var(--border)]">
                                No feedback yet. Be the first to share your thoughts!
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {feedbacks.map((fb) => (
                                    <div key={fb.id} className="bg-white rounded-lg border border-[var(--border)] p-5 shadow-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-2">✨ Glows</h4>
                                                <p className="text-gray-700 text-sm leading-relaxed">{fb.content.compliment}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">🌱 Grows</h4>
                                                <p className="text-gray-700 text-sm leading-relaxed">{fb.content.suggestion}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                                            <span>
                                                From: {fb.authorId && fb.authorId !== "anonymous" ? "Student Peer" : "Anonymous Peer"}
                                            </span>
                                            <span>
                                                {new Date(fb.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
