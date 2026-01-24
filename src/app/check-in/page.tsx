"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

export default function CheckInPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        intensity: 5,
        stress: 5,
        consistency: "neutral", // consistent, neutral, inconsistent
    });

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else {
            // TODO: Submit logic
            console.log("Submitted:", formData);
        }
    };

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Daily Check-in</h1>
                        <p className="text-muted-foreground">Take a moment to reflect on your journey today.</p>
                    </div>

                    <Card className="border-none shadow-lg bg-background/80 backdrop-blur-sm overflow-hidden">
                        <div className="h-2 bg-muted w-full">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: "0%" }}
                                animate={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-xl">
                                {step === 1 && "How intense was your preparation today?"}
                                {step === 2 && "How are you feeling mentally?"}
                                {step === 3 && "How consistent have you been lately?"}
                            </CardTitle>
                            <CardDescription>
                                {step === 1 && "It's okay to have light days. Honesty helps tracking."}
                                {step === 2 && "Rate your stress or anxiety levels."}
                                {step === 3 && "Consistency matters more than intensity."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">

                            {step === 1 && (
                                <div className="py-8">
                                    <div className="flex justify-between text-sm text-muted-foreground mb-4">
                                        <span>Rest Day</span>
                                        <span>Moderate</span>
                                        <span>Grind Mode</span>
                                    </div>
                                    <Slider
                                        value={formData.intensity}
                                        onValueChange={(val) => setFormData({ ...formData, intensity: val })}
                                        max={10}
                                    />
                                    <div className="mt-4 text-center text-2xl font-semibold text-primary">
                                        {formData.intensity}/10
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="py-8">
                                    <div className="flex justify-between text-sm text-muted-foreground mb-4">
                                        <span>Calm</span>
                                        <span>Manageable</span>
                                        <span>Overwhelmed</span>
                                    </div>
                                    <Slider
                                        value={formData.stress}
                                        onValueChange={(val) => setFormData({ ...formData, stress: val })}
                                        max={10}
                                    />
                                    <div className="mt-4 text-center text-2xl font-semibold text-primary">
                                        {formData.stress}/10
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="grid grid-cols-1 gap-4 py-4">
                                    {[
                                        { val: "consistent", label: "Very Consistent", desc: "I stuck to my plan most days." },
                                        { val: "neutral", label: "Somewhat Consistent", desc: "Missed a few sessions, but kept going." },
                                        { val: "inconsistent", label: "Struggling", desc: "Hard to maintain a routine right now." },
                                    ].map((option) => (
                                        <div
                                            key={option.val}
                                            className={cn(
                                                "p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50",
                                                formData.consistency === option.val ? "border-primary bg-primary/5" : "border-muted"
                                            )}
                                            onClick={() => setFormData({ ...formData, consistency: option.val })}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-semibold">{option.label}</div>
                                                    <div className="text-sm text-muted-foreground">{option.desc}</div>
                                                </div>
                                                {formData.consistency === option.val && <Check className="h-5 w-5 text-primary" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <Button onClick={handleNext} className="w-full sm:w-auto">
                                    {step === 3 ? "Complete Check-in" : "Next"}
                                    {step !== 3 && <ArrowRight className="ml-2 h-4 w-4" />}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
