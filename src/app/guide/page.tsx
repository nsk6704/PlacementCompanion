"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { guidanceData } from "@/data/guidance";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function GuideIndexPage() {
    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />
            <div className="container mx-auto px-4 py-12">
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold tracking-tight mb-4">Guidance & Support</h1>
                    <p className="text-muted-foreground text-lg">
                        Navigating the emotional landscape of placements. Select a stage to find targeted support and reframing techniques.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {guidanceData.map((stage) => (
                        <Card key={stage.id} className="flex flex-col border-none shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle>{stage.title}</CardTitle>
                                <CardDescription className="line-clamp-2">{stage.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                {/* Optional visual or summary could go here */}
                            </CardContent>
                            <CardFooter>
                                <Link href={`/guide/${stage.id}`} className="w-full">
                                    <Button variant="secondary" className="w-full justify-between group">
                                        Read Guide
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
