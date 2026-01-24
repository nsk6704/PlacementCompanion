"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PlotWrapper from "@/components/dashboard/PlotWrapper";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/api";

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [checkIns, setCheckIns] = useState<any[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await apiRequest("/check-ins");
                setCheckIns(data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Process Data for Charts
    const sortedData = [...checkIns].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // 1. Stress Trends
    const stressData = {
        x: sortedData.map(d => new Date(d.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })),
        y: sortedData.map(d => d.stress),
        type: "scatter" as const,
        mode: "lines+markers" as const,
        marker: { color: "#84A98C" }, // Primary color
        line: { shape: "spline" as const, width: 3 },
        name: "Stress Level",
    };

    // 2. Focus/Prep Distribution (Aggregation of prep_hours)
    const prepCounts = sortedData.reduce((acc: any, curr: any) => {
        const key = curr.prep_hours || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const activityData = {
        labels: Object.keys(prepCounts).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
        values: Object.values(prepCounts) as number[],
        type: "pie" as const,
        marker: {
            colors: ["#94A3B8", "#84A98C", "#E0F2F1", "#F3F4F6"]
        },
        hole: 0.4,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-muted/20 pb-20">
                <Navbar />
                <div className="container mx-auto px-4 py-20 text-center">
                    <p>Loading your insights...</p>
                </div>
            </div>
        )
    }

    if (checkIns.length === 0) {
        return (
            <div className="min-h-screen bg-muted/20 pb-20">
                <Navbar />
                <div className="container mx-auto px-4 py-20 text-center">
                    <h2 className="text-xl font-semibold mb-4">No check-ins yet</h2>
                    <p className="mb-4 text-muted-foreground">Complete your first daily reflection to see insights here.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Insights to keep you balanced. Remember, your well-being drives your performance.
                    </p>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Stress Trends</CardTitle>
                            <CardDescription>Your reported stress levels over time.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full h-[300px]">
                                <PlotWrapper
                                    data={[stressData]}
                                    layout={{
                                        autosize: true,
                                        margin: { l: 40, r: 20, t: 20, b: 40 },
                                        showlegend: false,
                                        xaxis: { showgrid: false },
                                        yaxis: { range: [0, 10], showgrid: true, gridcolor: "#F3F4F6" },
                                        paper_bgcolor: "rgba(0,0,0,0)",
                                        plot_bgcolor: "rgba(0,0,0,0)",
                                    }}
                                    style={{ width: "100%", height: "100%" }}
                                    useResizeHandler={true}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Prep Intensity</CardTitle>
                            <CardDescription>Distribution of your preparation hours.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full h-[300px]">
                                <PlotWrapper
                                    data={[activityData]}
                                    layout={{
                                        autosize: true,
                                        margin: { l: 20, r: 20, t: 20, b: 20 },
                                        paper_bgcolor: "rgba(0,0,0,0)",
                                        plot_bgcolor: "rgba(0,0,0,0)",
                                    }}
                                    style={{ width: "100%", height: "100%" }}
                                    useResizeHandler={true}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    <Card className="border-none shadow-md bg-accent/20">
                        <CardHeader>
                            <CardTitle className="text-secondary-foreground">Insights</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-white p-2 rounded-full shadow-sm text-2xl">🌱</div>
                                <div>
                                    <h4 className="font-semibold">Keep Tracking</h4>
                                    <p className="text-sm text-muted-foreground">You have logged {checkIns.length} check-ins. Consistency helps us spot patterns!</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
