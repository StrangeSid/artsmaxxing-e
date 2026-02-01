"use client";

import { useEffect, useState } from "react";
import { getPosts } from "@/lib/db";
import { Post, Category } from "@/types";
import PostCard from "@/components/PostCard";
import { shuffleArray } from "@/lib/utils";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

  const categories: (Category | 'All')[] = ['All', 'Art', 'Writing', 'Photography', 'Music', 'Design'];

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      const data = await getPosts(selectedCategory === 'All' ? undefined : selectedCategory);
      setPosts(shuffleArray(data));
      setLoading(false);
    }
    fetchPosts();
  }, [selectedCategory]);

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header Section */}
      <header className="mb-12 text-center md:text-left">
        <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">Creative Library</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Discover amazing creations from students in your community. Share without fear of judgment.
        </p>
      </header>

      {/* Filter Bar */}
      <div className="mb-8 flex flex-wrap gap-2 overflow-x-auto pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === cat
              ? "bg-primary text-white shadow-sm"
              : "bg-white text-gray-600 border border-border hover:bg-gray-50"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-4/3 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed border-border">
          <p className="text-gray-500 text-lg">No posts found in this category yet.</p>
          <p className="text-sm text-gray-400 mt-2">Be the first to share your work!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
