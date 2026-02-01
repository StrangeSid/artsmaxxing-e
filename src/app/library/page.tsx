"use client";

import { useEffect, useState, useMemo } from "react";
import { getPosts } from "@/lib/db";
import { Post, Category } from "@/types";
import PostCard from "@/components/PostCard";
import { shuffleArray } from "@/lib/utils";

const CATEGORIES: Category[] = ['Art', 'Writing', 'Photography', 'Music', 'Design'];

// Helper to get friendly date labels
function getDayLabel(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

    if (isToday) return "Today's Collection";
    if (isYesterday) return "Yesterday's Collection";
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function LibraryPage() {
    const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [showAnonymousOnly, setShowAnonymousOnly] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                // Pass undefined if 'All' is selected to fetch all posts
                const categoryArg = selectedCategory === 'All' ? undefined : selectedCategory;
                const fetchedPosts = await getPosts(categoryArg);
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [selectedCategory]);

    const organizedContent = useMemo(() => {
        if (posts.length === 0) return { spotlight: null, latest: null, groups: [] };

        let filtered = [...posts];

        // 1. Client-side Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(q) ||
                (p.description && p.description.toLowerCase().includes(q))
            );
        }

        // 2. Anonymous Filter
        if (showAnonymousOnly) {
            filtered = filtered.filter(p => p.visibility === 'anonymous');
        }

        // If filtering is active, skip spotlight layout and just show grid
        const isFiltering = searchQuery.trim().length > 0 || showAnonymousOnly;

        let latest: Post | null = null;
        let spotlight: Post | null = null;
        let remaining: Post[] = filtered;

        if (!isFiltering && filtered.length > 0) {
            // Sort by Date Descending first to identify Latest
            // (API usually returns sorted, but safe to ensure)
            filtered.sort((a, b) => b.createdAt - a.createdAt);

            // Extract Latest
            latest = filtered[0];
            remaining = filtered.slice(1);

            // Extract Spotlight (Random from last 7 days)
            const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
            const now = Date.now();
            const recentCandidates = remaining.filter(p => (now - p.createdAt) < ONE_WEEK_MS);

            if (recentCandidates.length > 0) {
                const idx = Math.floor(Math.random() * recentCandidates.length);
                spotlight = recentCandidates[idx];
                // Remove spotlight from remaining
                remaining = remaining.filter(p => p.id !== spotlight!.id);
            } else if (remaining.length > 0) {
                // Fallback: Random from all remaining
                const idx = Math.floor(Math.random() * remaining.length);
                spotlight = remaining[idx];
                remaining = remaining.filter(p => p.id !== spotlight!.id);
            }
        }

        // Group Remaining by Day
        const groupsMap: { label: string; posts: Post[]; sortValue: number }[] = [];

        remaining.forEach(post => {
            const label = getDayLabel(post.createdAt);
            // Use midnight timestamp for sorting groups
            const dateObj = new Date(post.createdAt);
            dateObj.setHours(0, 0, 0, 0);
            const sortValue = dateObj.getTime();

            let group = groupsMap.find(g => g.label === label);
            if (!group) {
                group = { label, posts: [], sortValue };
                groupsMap.push(group);
            }
            group.posts.push(post);
        });

        // Sort groups by date descending
        groupsMap.sort((a, b) => b.sortValue - a.sortValue);

        // Shuffle posts WITHIN each group
        groupsMap.forEach(g => {
            g.posts = shuffleArray(g.posts);
        });

        return { latest, spotlight, groups: groupsMap };

    }, [posts, searchQuery, showAnonymousOnly]);

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8 space-y-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Categorized Library</h1>
                    <p className="text-gray-600">Browse creations organized by type and curation.</p>
                </div>

                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-xl border border-[var(--border)] shadow-sm">
                    {/* Categories */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${selectedCategory === 'All'
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </button>
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${selectedCategory === cat
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Right Controls: Search & Anon */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 w-full md:w-48 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
                            />
                            <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600 whitespace-nowrap px-2">
                            <input
                                type="checkbox"
                                checked={showAnonymousOnly}
                                onChange={(e) => setShowAnonymousOnly(e.target.checked)}
                                className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            <span>Anonymous Only</span>
                        </label>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
                </div>
            ) : (
                <div className="space-y-12">

                    {/* Spotlight Section - Only show if not filtering */}
                    {organizedContent.spotlight && organizedContent.latest && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-gray-100">
                            {/* Spotlight Card */}
                            <div className="space-y-3">
                                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 flex items-center gap-2">
                                    <span>🌟</span> Weekly Spotlight
                                </h2>
                                <PostCard post={organizedContent.spotlight} />
                            </div>

                            {/* Latest Drop Card */}
                            <div className="space-y-3">
                                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                                    <span>🔥</span> Fresh Drop
                                </h2>
                                <PostCard post={organizedContent.latest} />
                            </div>
                        </div>
                    )}

                    {/* Main Gallery Groups */}
                    {organizedContent.groups.length > 0 ? (
                        <div className="space-y-10">
                            {organizedContent.groups.map((group) => (
                                <section key={group.label}>
                                    <h3 className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-4 border-l-4 border-[var(--primary)] pl-3">
                                        {group.label}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {group.posts.map((post) => (
                                            <PostCard key={post.id} post={post} />
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <p className="text-gray-500">No creations found matching your criteria.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
