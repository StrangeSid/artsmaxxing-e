"use client";

import Link from "next/link";
import { Post } from "@/types";

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {

    return (
        <div className="group bg-[var(--card-background)] rounded-lg border border-[var(--border)] overflow-hidden transition-shadow hover:shadow-md flex flex-col h-full">

            <div className="relative aspect-[4/3] bg-gray-100 border-b border-[var(--border)] overflow-hidden">
                {post.fileType === "image" ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={post.fileUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">

                        <span className="text-sm font-medium uppercase tracking-wider">{post.fileType}</span>
                    </div>
                )}


                <div className="absolute top-3 right-3">
                    {post.visibility === 'private' && (
                        <span className="bg-gray-900/10 backdrop-blur-sm text-gray-700 text-xs px-2 py-1 rounded-full border border-white/20">
                            🔒 Private
                        </span>
                    )}
                    {post.visibility === 'anonymous' && (
                        <span className="bg-white/90 backdrop-blur-sm text-gray-600 text-xs px-2 py-1 rounded-full shadow-sm border border-gray-100">
                            👻 Anonymous
                        </span>
                    )}
                </div>
            </div>


            <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-2">
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600`}>
                        {post.category}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-[var(--foreground)] mb-1 leading-tight group-hover:text-[var(--primary)] transition-colors">
                    {post.title}
                </h3>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {post.description || "No description provided."}
                </p>


                <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between">
                    <div className="text-xs text-gray-500 font-medium">
                        by {post.visibility === 'anonymous' ? 'Anonymous' : (post.authorName || 'Student')}
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href={`/feedback/${post.id}`}
                            className="text-xs font-semibold text-[var(--primary)] hover:underline border border-[var(--primary)] px-3 py-1.5 rounded transition-colors hover:bg-[var(--primary)] hover:text-white"
                        >
                            View
                        </Link>
                        <Link
                            href={`/feedback/${post.id}`}
                            className="text-xs font-semibold text-gray-600 hover:text-[var(--foreground)] border border-[var(--border)] px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
                        >
                            Feedback
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
