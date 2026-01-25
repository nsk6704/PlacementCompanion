"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, TrendingDown, Minus, Users, Brain, Heart } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface Comparison {
    context: string;
    metric: string;
    percentage: number;
    count: number;
    message: string;
    user_value: number;
    population_mean: number;
}

interface Recommendation {
    category: string;
    priority: string;
    message: string;
    action: string;
}

interface Insights {
    comparative: {
        comparisons: Comparison[];
    };
    trends: {
        stress_direction?: string;
        recent_spike?: boolean;
        consistency_score?: number;
        recent_change?: number;
    };
    recommendations: Recommendation[];
    indices: {
        anxiety: number | null;
        burnout: number | null;
    };
}

export default function ResultsPage() {
    const [insights, setInsights] = useState<Insights | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const data = await apiRequest("/insights/personalized");
                setInsights(data);
            } catch (err: any) {
                setError(err.message || "Failed to load insights");
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-muted/20">
                <Navbar />
                <div className="container mx-auto px-4 py-12 max-w-4xl">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                        <p className="mt-4 text-muted-foreground">Analyzing your responses...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !insights) {
        return (
            <div className="min-h-screen bg-muted/20">
                <Navbar />
                <div className="container mx-auto px-4 py-12 max-w-4xl">
                    <Card className="p-8 text-center">
                        <p className="text-red-500">{error || "No insights available"}</p>
                        <Link href="/check-in">
                            <Button className="mt-4">Try Again</Button>
                        </Link>
                    </Card>
                </div>
            </div>
        );
    }

    const getTrendIcon = (direction?: string) => {
        if (direction === "increasing") return <TrendingUp className="h-5 w-5 text-red-500" />;
        if (direction === "decreasing") return <TrendingDown className="h-5 w-5 text-green-500" />;
        return <Minus className="h-5 w-5 text-muted-foreground" />;
    };

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
                            Based on your responses, here's what the data says. Your feelings are a normal response to your situation.
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-3">
                            Insights powered by research with 130+ students across departments
                        </p>
                    </div>

                    {/* Indices Summary */}
                    {(insights.indices.anxiety || insights.indices.burnout) && (
                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                            {insights.indices.anxiety && (
                                <Card className="border-l-4 border-l-orange-500">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3">
                                            <Brain className="h-8 w-8 text-orange-500" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Your Anxiety Index</p>
                                                <p className="text-3xl font-bold">{insights.indices.anxiety.toFixed(1)}<span className="text-lg text-muted-foreground">/5</span></p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            {insights.indices.burnout && (
                                <Card className="border-l-4 border-l-red-500">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3">
                                            <Heart className="h-8 w-8 text-red-500" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Your Burnout Index</p>
                                                <p className="text-3xl font-bold">{insights.indices.burnout.toFixed(1)}<span className="text-lg text-muted-foreground">/5</span></p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Comparative Insights */}
                    {insights.comparative.comparisons && insights.comparative.comparisons.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Users className="h-6 w-6 text-primary" />
                                You're In Good Company
                            </h2>
                            <div className="grid gap-4">
                                {insights.comparative.comparisons.map((comp, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <span className="text-3xl font-bold text-primary">{comp.percentage}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-lg font-semibold mb-2">{comp.message}</p>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <span>Based on {comp.count} {comp.context}</span>
                                                            <span>•</span>
                                                            <span>Your {comp.metric}: {comp.user_value}</span>
                                                            <span>•</span>
                                                            <span>Average: {comp.population_mean}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trends */}
                    {insights.trends && Object.keys(insights.trends).length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Your Trends</h2>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {insights.trends.stress_direction && (
                                            <div className="flex items-center gap-3">
                                                {getTrendIcon(insights.trends.stress_direction)}
                                                <div>
                                                    <p className="font-medium">Stress Trend</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Your stress has been {insights.trends.stress_direction} over recent check-ins
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {insights.trends.recent_spike && (
                                            <div className="flex items-center gap-3">
                                                <TrendingUp className="h-5 w-5 text-orange-500" />
                                                <div>
                                                    <p className="font-medium">Recent Spike Detected</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        We noticed a sudden increase in your stress levels
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Recommendations */}
                    {insights.recommendations && insights.recommendations.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Personalized Recommendations</h2>
                            <div className="grid gap-4">
                                {insights.recommendations.map((rec, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Card className={cn(
                                            "border-l-4",
                                            rec.priority === "high" ? "border-l-red-500" :
                                                rec.priority === "medium" ? "border-l-orange-500" :
                                                    "border-l-green-500"
                                        )}>
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-2 mb-2">
                                                    <span className={cn(
                                                        "text-xs font-semibold px-2 py-1 rounded",
                                                        rec.priority === "high" ? "bg-red-100 text-red-700" :
                                                            rec.priority === "medium" ? "bg-orange-100 text-orange-700" :
                                                                "bg-green-100 text-green-700"
                                                    )}>
                                                        {rec.priority.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="font-semibold mb-2">{rec.message}</p>
                                                <p className="text-sm text-muted-foreground">💡 {rec.action}</p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

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

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
