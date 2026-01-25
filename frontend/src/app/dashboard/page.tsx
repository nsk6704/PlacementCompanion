"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PlotWrapper from "@/components/dashboard/PlotWrapper";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/api";
import { TrendingUp, TrendingDown, Minus, Users, Target, Lightbulb, AlertCircle, Brain } from "lucide-react";

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [checkIns, setCheckIns] = useState<any[]>([]);
    const [insights, setInsights] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [checkInsData, insightsData] = await Promise.all([
                    apiRequest("/check-ins"),
                    apiRequest("/insights/personalized")
                ]);
                setCheckIns(checkInsData);
                setInsights(insightsData);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Process Data for Charts
    const sortedData = [...checkIns].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // 1. Stress Trends
    const stressData = {
        x: sortedData.map(d => new Date(d.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })),
        y: sortedData.map(d => d.stress),
        type: "scatter" as const,
        mode: "lines+markers" as const,
        marker: { color: "#84A98C" },
        line: { shape: "spline" as const, width: 3 },
        name: "Stress Level",
    };

    // 2. Prep Distribution
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
            colors: ["#52796F", "#84A98C", "#CAD2C5", "#2F3E46", "#354F52"]
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

    const getTrendIcon = (direction: string) => {
        if (direction === "increasing") return <TrendingUp className="h-5 w-5 text-red-500" />;
        if (direction === "decreasing") return <TrendingDown className="h-5 w-5 text-green-500" />;
        return <Minus className="h-5 w-5 text-muted-foreground" />;
    };

    const getComparisonColor = (comparison: string) => {
        if (comparison === "higher") return "text-orange-600";
        if (comparison === "lower") return "text-green-600";
        return "text-blue-600";
    };

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
                        Personalized insights based on {checkIns.length} check-ins
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                        Powered by research with 130+ students across departments
                    </p>
                </motion.div>

                {/* Insights Cards Row */}
                {insights && (
                    <div className="grid gap-6 md:grid-cols-3 mb-6">
                        {/* Comparative Analysis - Science Driven */}
                        {insights.comparative?.comparisons?.length > 0 && (
                            <Card className="border-none shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">You vs. Peers</CardTitle>
                                    </div>
                                    <CardDescription>Based on 130+ student survey</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {insights.comparative.comparisons.slice(0, 3).map((comp: any, idx: number) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between items-end">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{comp.context}</p>
                                                <span className="text-lg font-bold text-primary">{comp.percentage}%</span>
                                            </div>
                                            <p className="text-sm leading-tight text-foreground/80">Similar {comp.metric} levels as you</p>
                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${comp.percentage}%` }}
                                                    className="h-full bg-primary"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Metrics - Science Driven */}
                        <Card className="border-none shadow-md">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">Research Indices</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
                                        <p className="text-xs font-bold text-orange-600 uppercase">Anxiety Index</p>
                                        <p className="text-2xl font-black text-orange-700">{insights.indices?.anxiety || "N/A"}</p>
                                        <p className="text-[10px] text-orange-600/70 mt-1">Scale of 1-5</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                                        <p className="text-xs font-bold text-red-600 uppercase">Burnout Index</p>
                                        <p className="text-2xl font-black text-red-700">{insights.indices?.burnout || "N/A"}</p>
                                        <p className="text-[10px] text-red-600/70 mt-1">Scale of 1-5</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Your Prep Profile</p>
                                    <div className="px-3 py-2 rounded-md bg-muted/50 border border-muted-foreground/10">
                                        <p className="text-sm font-semibold">{insights.indices?.prep_profile || "Calculating..."}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vital Trends & Stats */}
                        <Card className="border-none shadow-md">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">Vital Trends</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {insights.trends?.stress_direction && (
                                    <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Stress Path</p>
                                        <div className="flex items-center gap-1.5">
                                            {getTrendIcon(insights.trends.stress_direction)}
                                            <span className="text-sm font-bold capitalize">{insights.trends.stress_direction}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-center p-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Consistency</p>
                                        <p className="text-xl font-black text-primary">
                                            {insights.trends?.consistency_score !== undefined ? `${Math.round(insights.trends.consistency_score * 100)}%` : "N/A"}
                                        </p>
                                    </div>
                                    <div className="text-center p-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Latest Stress</p>
                                        <p className="text-xl font-black text-primary">{checkIns[0]?.stress || 0}/10</p>
                                    </div>
                                </div>
                                {insights.trends?.recent_spike && (
                                    <div className="mx-2 p-2 rounded bg-orange-100/50 flex items-center gap-2 text-orange-700 animate-pulse">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-[11px] font-bold uppercase tracking-tight">Recent Stress Spike</span>
                                    </div>
                                )}
                                <div className="pt-2 border-t flex justify-between items-center text-[10px] text-muted-foreground font-medium">
                                    <span>Total Journey: {checkIns.length} Days</span>
                                    <span>Last Active: {new Date(checkIns[0]?.created_at).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Charts Row */}
                <div className="grid gap-6 md:grid-cols-2 mb-6">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Stress Trends</CardTitle>
                            <CardDescription>Your reported stress levels over time</CardDescription>
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
                            <CardTitle>Prep Intensity Distribution</CardTitle>
                            <CardDescription>Your preparation hours profile across all check-ins</CardDescription>
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
                                        showlegend: true,
                                        legend: { orientation: "h", y: -0.2 }
                                    }}
                                    style={{ width: "100%", height: "100%" }}
                                    useResizeHandler={true}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recommendations */}
                {insights?.recommendations && insights.recommendations.length > 0 && (
                    <Card className="border-none shadow-md bg-accent/20">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-primary" />
                                <CardTitle>Personalized Recommendations</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {insights.recommendations.map((rec: any, idx: number) => (
                                <div key={idx} className="flex items-start gap-4 p-4 bg-background rounded-lg">
                                    <div className={`mt-1 px-2 py-1 rounded text-xs font-semibold ${rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                        rec.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {rec.priority.toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium mb-1">{rec.message}</p>
                                        <p className="text-sm text-muted-foreground">{rec.action}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
