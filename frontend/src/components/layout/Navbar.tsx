"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const navItems = [
    { name: "Check-in", href: "/check-in" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Guide", href: "/guide" },
];

export function Navbar() {
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);
        };

        checkAuth();
        // Listen for storage events (optional, but good for multi-tab sync)
        window.addEventListener("storage", checkAuth);

        // Also a custom event for instant updates within the app
        window.addEventListener("auth-change", checkAuth);

        return () => {
            window.removeEventListener("storage", checkAuth);
            window.removeEventListener("auth-change", checkAuth);
        };
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        // Dispatch event
        window.dispatchEvent(new Event("auth-change"));
        router.push("/login");
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-foreground">
                        Placement Companion
                    </span>
                </Link>
                <nav className="flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary relative",
                                pathname === item.href
                                    ? "text-primary"
                                    : "text-muted-foreground"
                            )}
                        >
                            {item.name}
                            {pathname === item.href && (
                                <motion.div
                                    layoutId="underline"
                                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                                />
                            )}
                        </Link>
                    ))}
                    {isLoggedIn ? (
                        <Button size="sm" variant="outline" onClick={handleSignOut}>Sign Out</Button>
                    ) : (
                        <Link href="/login">
                            <Button size="sm" variant="outline">Sign In</Button>
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
