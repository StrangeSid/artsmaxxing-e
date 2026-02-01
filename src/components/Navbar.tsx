"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const pathname = usePathname();
    const { user, loading } = useAuth();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-border z-50 flex items-center justify-between px-6 md:px-12">
            <Link href="/" className="flex items-center">
                <Image
                    src="/logo.svg"
                    alt="Creative Studio"
                    width={0}
                    height={0}
                    className="h-12 w-auto"
                    priority
                />
            </Link>
            <div className="hidden md:flex items-center gap-8">
                <NavLink href="/" label="Home" active={isActive("/")} />
                <NavLink href="/library" label="Library" active={isActive("/library")} />
                <NavLink href="/upload" label="Upload" active={isActive("/upload")} />
                <NavLink href="/dashboard" label="My Work" active={isActive("/dashboard")} />
            </div>
            <div className="flex items-center gap-4">
                {loading ? (
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                ) : user ? (
                    <Link href="/dashboard">{ }
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                            {user.displayName?.[0] || "U"}
                        </div>
                    </Link>
                ) : (
                    <Link href="/login" className="text-sm font-medium text-primary hover:text-primary-hover">
                        Log In
                    </Link>
                )}
            </div>
        </nav>
    );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
    return (
        <Link
            href={href}
            className={`text-sm font-medium transition-colors duration-200 ${active
                ? "text-primary"
                : "text-gray-500 hover:text-foreground"
                }`}
        >
            {label}
        </Link>
    );
}
