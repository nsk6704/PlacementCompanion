"use client";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { guidanceData } from "@/data/guidance";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Lightbulb, AlertTriangle } from "lucide-react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";

export default function GuidanceDetail() {
    const { stage: stageId } = useParams();
    const stage = guidanceData.find((s) => s.id === stageId);

    if (!stage) {
        // Ideally use notFound() but we are in client component, can just show error or return null
        return (
            <div className="min-h-screen flex items-center justify-center flex-col">
                <h1 className="text-2xl font-bold">Stage not found</h1>
                <Link href="/guide" className="text-primary hover:underline mt-4">Go back to Guide</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <Link href="/guide">
                    <Button variant="ghost" size="sm" className="mb-6 pl-0 hover:pl-0 hover:bg-transparent hover:text-primary">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Guides
                    </Button>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{stage.title}</h1>
                    <p className="text-xl text-muted-foreground mb-8 text-pretty">{stage.description}</p>

                    <div className="grid gap-8">
                        {/* Reframing Section - The Core Value */}
                        <Card className="border-l-4 border-l-primary bg-primary/5 border-y-0 border-r-0 rounded-r-lg shadow-sm">
                            <CardHeader>
                                <div className="flex items-center gap-2 text-primary font-semibold">
                                    <Lightbulb className="h-5 w-5" />
                                    Reframing the Situation
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-medium leading-relaxed">
                                    "{stage.reframing}"
                                </p>
                            </CardContent>
                        </Card>

                        {/* Challenges */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" /> Common Stressors
                            </h2>
                            <div className="space-y-3">
                                {stage.challenges.map((challenge, idx) => (
                                    <Card key={idx} className="bg-background/80 shadow-sm border-none">
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                                            <span>{challenge}</span>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Actionable Steps */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" /> Practical Actions
                            </h2>
                            <div className="space-y-3">
                                {stage.actions.map((action, idx) => (
                                    <Card key={idx} className="bg-background/80 shadow-sm border-none">
                                        <CardContent className="p-4 flex items-start gap-3">
                                            <div className="mt-1.5 h-4 w-4 rounded border border-primary flex items-center justify-center shrink-0">
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                            </div>
                                            <span className="text-foreground/90">{action}</span>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}
