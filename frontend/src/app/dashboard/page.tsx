"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PlotWrapper from "@/components/dashboard/PlotWrapper";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/api";
import { TrendingUp, TrendingDown, Minus, Users, Target, Lightbulb, AlertCircle } from "lucide-react";

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
                        {/* Comparative Analysis */}
                        {insights.comparative && Object.keys(insights.comparative).length > 0 && (
                            <Card className="border-none shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">You vs. Peers</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {insights.comparative.stress_percentile && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Stress Percentile</p>
                                            <p className="text-2xl font-bold">{Math.round(insights.comparative.stress_percentile)}th</p>
                                        </div>
                                    )}
                                    {insights.comparative.vs_department && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">vs. Department</p>
                                            <p className={`text-sm font-semibold ${getComparisonColor(insights.comparative.vs_department)}`}>
                                                {insights.comparative.vs_department}
                                            </p>
                                        </div>
                                    )}
                                    {insights.comparative.vs_stage && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">vs. Stage</p>
                                            <p className={`text-sm font-semibold ${getComparisonColor(insights.comparative.vs_stage)}`}>
                                                {insights.comparative.vs_stage}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Trend Analysis */}
                        {insights.trends && Object.keys(insights.trends).length > 0 && (
                            <Card className="border-none shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Trends</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {insights.trends.stress_direction && (
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">Stress Direction</p>
                                            <div className="flex items-center gap-2">
                                                {getTrendIcon(insights.trends.stress_direction)}
                                                <span className="text-sm font-semibold capitalize">{insights.trends.stress_direction}</span>
                                            </div>
                                        </div>
                                    )}
                                    {insights.trends.consistency_score !== undefined && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Consistency</p>
                                            <p className="text-sm font-semibold">{Math.round(insights.trends.consistency_score * 100)}%</p>
                                        </div>
                                    )}
                                    {insights.trends.recent_spike && (
                                        <div className="flex items-center gap-2 text-orange-600">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-sm font-semibold">Recent spike detected</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Stats */}
                        <Card className="border-none shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Check-ins</p>
                                    <p className="text-2xl font-bold">{checkIns.length}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Latest Stress</p>
                                    <p className="text-2xl font-bold">{checkIns[0]?.stress}/10</p>
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
                            <CardTitle>Prep Intensity</CardTitle>
                            <CardDescription>Distribution of your preparation hours</CardDescription>
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
