"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { createPost } from "@/lib/db";
import { Category, Post } from "@/types";

export default function UploadPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();


    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<Category>("Art");
    const [visibility, setVisibility] = useState<Post['visibility']>("public");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);


    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);


    if (!authLoading && !user) {
        router.push("/login");
        return null;
    }

    if (authLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
            </div>
        );
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];


            if (selectedFile.size > 50 * 1024 * 1024) {
                setError("File size exceeds 50MB limit.");
                return;
            }

            setFile(selectedFile);
            setError(null);


            if (selectedFile.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];

            if (droppedFile.size > 50 * 1024 * 1024) {
                setError("File size exceeds 50MB limit.");
                return;
            }
            setFile(droppedFile);
            setError(null);
            if (droppedFile.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(droppedFile);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const determineFileType = (mimeType: string): Post['fileType'] => {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        return 'other';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !user || !user.uid) return;

        setUploading(true);
        setError(null);

        try {

            const storageRef = ref(storage, `uploads/${user.uid}/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(prog);
                },
                (err) => {
                    console.error("Upload error:", err);
                    setError("Failed to upload file. Please try again.");
                    setUploading(false);
                },
                async () => {

                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);


                    const postData: Omit<Post, 'id' | 'createdAt' | 'views'> = {
                        authorId: user.uid,
                        authorName: user.displayName || "Anonymous Artist",
                        authorPhotoURL: user.photoURL || undefined,
                        title,
                        description,
                        fileUrl: downloadURL,
                        fileType: determineFileType(file.type),
                        category,
                        visibility
                    };

                    await createPost(postData);


                    router.push("/dashboard");
                }
            );

        } catch (err: unknown) {
            console.error("Submission error:", err);
            setError("Failed to create post. Please try again.");
            setUploading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Share Your Creation</h1>
            <p className="text-gray-600 mb-8">Upload your work in a safe, judgment-free environment.</p>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

                <div
                    className={`relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer
                        ${file ? 'border-[var(--primary)] bg-blue-50/30' : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-gray-50'}
                    `}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,video/*,audio/*,.pdf"
                    />

                    {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt="Preview" className="max-h-64 object-contain rounded-lg shadow-sm" />
                    ) : file ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-2xl mb-4 mx-auto">
                                📄
                            </div>
                            <p className="font-medium text-[var(--foreground)]">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-50 text-[var(--primary)] rounded-full flex items-center justify-center text-2xl mb-4 mx-auto">
                                ⬆️
                            </div>
                            <p className="font-medium text-[var(--foreground)] text-lg">Click to upload or drag and drop</p>
                            <p className="text-sm text-gray-400 mt-2">PNG, JPG, MP3, PDF up to 50MB</p>
                        </div>
                    )}
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                                placeholder="Give your work a name..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <div className="relative">

                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as Category)}
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] appearance-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all cursor-pointer bg-white"
                                >
                                    <option value="Art">Art</option>
                                    <option value="Writing">Writing</option>
                                    <option value="Photography">Photography</option>
                                    <option value="Music">Music</option>
                                    <option value="Design">Design</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">▼</div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all min-h-[120px]"
                                placeholder="Tell us about your creation..."
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Visibility Settings</label>

                        <div className="space-y-3">
                            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${visibility === 'public' ? 'border-[var(--primary)] bg-blue-50/50 shadow-sm' : 'border-[var(--border)] hover:border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="public"
                                    checked={visibility === 'public'}
                                    onChange={() => setVisibility('public')}
                                    className="mt-1 text-[var(--primary)] focus:ring-[var(--primary)]"
                                />
                                <div>
                                    <p className="font-medium text-[var(--foreground)]">Public with Name</p>
                                    <p className="text-xs text-gray-500 mt-1">Visible to everyone with your name attached. Best for building your portfolio.</p>
                                </div>
                            </label>

                            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${visibility === 'anonymous' ? 'border-[var(--primary)] bg-blue-50/50 shadow-sm' : 'border-[var(--border)] hover:border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="anonymous"
                                    checked={visibility === 'anonymous'}
                                    onChange={() => setVisibility('anonymous')}
                                    className="mt-1 text-[var(--primary)] focus:ring-[var(--primary)]"
                                />
                                <div>
                                    <p className="font-medium text-[var(--foreground)]">Anonymous Public</p>
                                    <p className="text-xs text-gray-500 mt-1">Visible to everyone, but your name is hidden. Great for getting feedback without pressure.</p>
                                </div>
                            </label>

                            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${visibility === 'private' ? 'border-[var(--primary)] bg-blue-50/50 shadow-sm' : 'border-[var(--border)] hover:border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="private"
                                    checked={visibility === 'private'}
                                    onChange={() => setVisibility('private')}
                                    className="mt-1 text-[var(--primary)] focus:ring-[var(--primary)]"
                                />
                                <div>
                                    <p className="font-medium text-[var(--foreground)]">Private Archive</p>
                                    <p className="text-xs text-gray-500 mt-1">Only you can see this. Use it to track your progress over time.</p>
                                </div>
                            </label>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={uploading || !file || !title}
                                className="w-full py-3 px-6 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Uploading {Math.round(progress)}%...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Publish Creation</span>
                                        <span>→</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
