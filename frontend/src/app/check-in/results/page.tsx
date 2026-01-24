"use client";

import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRelevantInsights, UserProfile } from "@/lib/insightsEngine";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { Suspense } from "react";

function ResultsContent() {
    const searchParams = useSearchParams();

    // Reconstruct profile from query params
    const profile: UserProfile = {
        department: searchParams.get("department") || undefined,
        cgpa: searchParams.get("cgpa") || undefined,
        stage: searchParams.get("stage") || undefined,
        prepHours: (searchParams.get("prepHours") as any) || undefined,
        prepConsistency: (searchParams.get("prepConsistency") as any) || undefined,
        stress: Number(searchParams.get("stress")) || 0,
        coping: searchParams.get("coping") || undefined,
    };

    const insights = getRelevantInsights(profile);

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-full mb-4">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">You Are Not Alone</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Based on your profile, here's what the data says. Your feelings are a normal response to your situation.
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-3">
                            Insights powered by research with 130+ students across departments
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {insights.length > 0 ? (
                            insights.map((insight, idx) => (
                                <motion.div
                                    key={insight.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex gap-4 items-start">
                                                <div className="mt-1">
                                                    <AlertCircle className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium text-foreground leading-relaxed mb-3">
                                                        {insight.message}
                                                    </p>
                                                    <div className="text-sm text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded w-fit">
                                                        Source: {insight.source}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <Card className="p-8 text-center bg-muted/30 border-dashed">
                                <p className="text-muted-foreground">
                                    You seem to be in a unique spot! Keep trusting your process.
                                    Check out our general guidance for more tips.
                                </p>
                            </Card>
                        )}
                    </div>

                    <div className="mt-12 flex justify-center gap-4">
                        <Link href="/dashboard">
                            <Button size="lg" className="rounded-full px-8">
                                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/guide">
                            <Button variant="outline" size="lg" className="rounded-full px-8">
                                Browse Guides
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div>Loading insights...</div>}>
            <ResultsContent />
        </Suspense>
    )
}
