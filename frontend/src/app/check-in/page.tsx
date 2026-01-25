"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { apiRequest } from "@/lib/api";
import Link from "next/link";
import { BookOpen, LineChart, Sparkles } from "lucide-react";

interface CheckInFormData {
    // Academic context
    cgpa: string;
    stage: string;

    // Placement activity
    applications_count: string;
    challenging_stage: string;

    // Anxiety indicators (1-5 scale)
    anxiety_thinking: number;
    anxiety_overwhelmed: number;
    anxiety_rejections: number;
    anxiety_peer_comparison: number;
    anxiety_concentration: number;

    // Burnout indicators (1-5 scale)
    burnout_sleep: number;
    burnout_exhaustion: number;
    burnout_motivation: number;
    burnout_physical: number;

    // Preparation habits
    prep_hours: string;
    prep_consistency: string;

    // Stress & coping
    stress: number;
    coping: string;
}

export default function CheckInPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isAlreadyCheckedIn, setIsAlreadyCheckedIn] = useState(false);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    const [formData, setFormData] = useState<CheckInFormData>({
        cgpa: "",
        stage: "",
        applications_count: "",
        challenging_stage: "",
        anxiety_thinking: 3,
        anxiety_overwhelmed: 3,
        anxiety_rejections: 3,
        anxiety_peer_comparison: 3,
        anxiety_concentration: 3,
        burnout_sleep: 3,
        burnout_exhaustion: 3,
        burnout_motivation: 3,
        burnout_physical: 3,
        prep_hours: "moderate",
        prep_consistency: "moderate",
        stress: 5,
        coping: "",
    });

    const totalSteps = 7;

    // Check auth and daily status on mount
    useEffect(() => {
        if (!localStorage.getItem('token')) {
            router.push('/login');
            return;
        }

        const checkStatus = async () => {
            try {
                const status = await apiRequest("/check-in/status");
                if (!status.can_check_in) {
                    setIsAlreadyCheckedIn(true);
                }
            } catch (error) {
                console.error("Failed to check status:", error);
            } finally {
                setIsLoadingStatus(false);
            }
        };

        checkStatus();
    }, [router]);

    const handleNext = async () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            try {
                // Get user's branch from localStorage or fetch from API
                // For now, we'll use a placeholder - in production, fetch from user profile
                const payload = {
                    department: "CS/IT", // This should come from user profile
                    cgpa: formData.cgpa,
                    stage: formData.stage,
                    prep_hours: formData.prep_hours,
                    prep_consistency: formData.prep_consistency,
                    stress: formData.stress,
                    coping: formData.coping,
                    anxiety_thinking: formData.anxiety_thinking,
                    anxiety_overwhelmed: formData.anxiety_overwhelmed,
                    anxiety_rejections: formData.anxiety_rejections,
                    anxiety_peer_comparison: formData.anxiety_peer_comparison,
                    anxiety_concentration: formData.anxiety_concentration,
                    burnout_sleep: formData.burnout_sleep,
                    burnout_exhaustion: formData.burnout_exhaustion,
                    burnout_motivation: formData.burnout_motivation,
                    burnout_physical: formData.burnout_physical,
                    applications_count: formData.applications_count,
                    challenging_stage: formData.challenging_stage
                };

                await apiRequest("/check-in", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });

                router.push(`/check-in/results`);
            } catch (error) {
                console.error("Failed to submit check-in:", error);
            }
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    }

    const updateField = (field: keyof CheckInFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    if (isLoadingStatus) {
        return (
            <div className="min-h-screen bg-muted/20">
                <Navbar />
                <div className="container mx-auto px-4 py-32 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Preparing your daily reflection...</p>
                </div>
            </div>
        );
    }

    if (isAlreadyCheckedIn) {
        return (
            <div className="min-h-screen bg-muted/20 pb-20">
                <Navbar />
                <div className="container mx-auto px-4 py-12 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-8 py-12"
                    >
                        <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-full mb-4">
                            <Sparkles className="h-10 w-10" />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold tracking-tight">Daily Reflection Complete!</h1>
                            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                                You've already checked in for today. Taking one moment of daily reflection is a powerful way to manage placement stress.
                            </p>
                        </div>

                        <div className="grid gap-4 mt-8">
                            <Card className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <CardContent className="p-0">
                                    <Link href="/dashboard" className="flex items-center p-6 gap-4 text-left group">
                                        <div className="p-3 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <LineChart className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold">View Progress</h3>
                                            <p className="text-sm text-muted-foreground">See how your stress and metrics have changed over time.</p>
                                        </div>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <CardContent className="p-0">
                                    <Link href="/guide" className="flex items-center p-6 gap-4 text-left group">
                                        <div className="p-3 bg-secondary/10 text-secondary rounded-lg group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold">Explore Guides</h3>
                                            <p className="text-sm text-muted-foreground">Browse techniques for managing interview anxiety and burnout.</p>
                                        </div>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="pt-8">
                            <p className="text-sm text-muted-foreground">
                                Come back tomorrow for your next check-in. Consistency is key!
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

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
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Daily Check-In</h1>
                        <p className="text-muted-foreground">A comprehensive reflection to track your journey and get personalized insights.</p>
                        <p className="text-xs text-muted-foreground/70 mt-2">Based on research with 130+ students across departments</p>
                    </div>

                    <Card className="border-none shadow-lg bg-background/80 backdrop-blur-sm overflow-hidden">
                        <div className="h-2 bg-muted w-full">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: "0%" }}
                                animate={{ width: `${(step / totalSteps) * 100}%` }}
                            />
                        </div>

                        <CardContent className="pt-6 min-h-[400px] flex flex-col justify-between">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex-1"
                                >
                                    {/* STEP 1: ACADEMIC CONTEXT */}
                                    {step === 1 && (
                                        <div className="space-y-6">
                                            <Header title="Your Academic Context" desc="This helps us compare your experience with similar students." />
                                            <SelectGroup
                                                label="What's your current CGPA range?"
                                                options={[
                                                    { val: "Below 6", label: "Below 6" },
                                                    { val: "6.0–6.9", label: "6.0 - 6.9" },
                                                    { val: "7.0–7.9", label: "7.0 - 7.9" },
                                                    { val: "8.0–8.9", label: "8.0 - 8.9" },
                                                    { val: "9.0 and above", label: "9.0 and above" },
                                                ]}
                                                value={formData.cgpa}
                                                onChange={(v) => updateField("cgpa", v)}
                                            />
                                        </div>
                                    )}

                                    {/* STEP 2: PLACEMENT ACTIVITY */}
                                    {step === 2 && (
                                        <div className="space-y-6">
                                            <Header title="Placement Activity" desc="Tell us about your placement journey so far." />
                                            <SelectGroup
                                                label="What stage are you currently at?"
                                                options={[
                                                    { val: "Online tests or assessments", label: "Online Tests / Assessments" },
                                                    { val: "Technical Interviews", label: "Technical Interviews" },
                                                    { val: "HR/Managerial Interviews", label: "HR / Managerial Round" },
                                                ]}
                                                value={formData.stage}
                                                onChange={(v) => updateField("stage", v)}
                                            />
                                            <SelectGroup
                                                label="Approximately how many companies have you applied to?"
                                                options={[
                                                    { val: "0-10", label: "0 - 10 companies" },
                                                    { val: "11-25", label: "11 - 25 companies" },
                                                    { val: "26-50", label: "26 - 50 companies" },
                                                    { val: "50+", label: "50+ companies" },
                                                ]}
                                                value={formData.applications_count}
                                                onChange={(v) => updateField("applications_count", v)}
                                            />
                                            <SelectGroup
                                                label="Which stage do you find most challenging?"
                                                options={[
                                                    { val: "online_tests", label: "Online Tests" },
                                                    { val: "technical", label: "Technical Interviews" },
                                                    { val: "hr", label: "HR Round" },
                                                    { val: "all_equally", label: "All Equally Challenging" },
                                                ]}
                                                value={formData.challenging_stage}
                                                onChange={(v) => updateField("challenging_stage", v)}
                                            />
                                        </div>
                                    )}

                                    {/* STEP 3: ANXIETY INDICATORS */}
                                    {step === 3 && (
                                        <div className="space-y-6">
                                            <Header title="Anxiety & Pressure" desc="Rate how much you agree with these statements (1 = Strongly Disagree, 5 = Strongly Agree)" />
                                            <LikertScale
                                                label="I feel anxious when thinking about placements"
                                                value={formData.anxiety_thinking}
                                                onChange={(v) => updateField("anxiety_thinking", v)}
                                            />
                                            <LikertScale
                                                label="I feel overwhelmed by the amount of preparation required"
                                                value={formData.anxiety_overwhelmed}
                                                onChange={(v) => updateField("anxiety_overwhelmed", v)}
                                            />
                                            <LikertScale
                                                label="Rejections negatively affect my motivation"
                                                value={formData.anxiety_rejections}
                                                onChange={(v) => updateField("anxiety_rejections", v)}
                                            />
                                        </div>
                                    )}

                                    {/* STEP 4: MORE ANXIETY INDICATORS */}
                                    {step === 4 && (
                                        <div className="space-y-6">
                                            <Header title="Anxiety & Pressure (continued)" desc="Rate how much you agree with these statements" />
                                            <LikertScale
                                                label="Comparing myself with peers increases pressure"
                                                value={formData.anxiety_peer_comparison}
                                                onChange={(v) => updateField("anxiety_peer_comparison", v)}
                                            />
                                            <LikertScale
                                                label="I find it hard to concentrate due to placement-related stress"
                                                value={formData.anxiety_concentration}
                                                onChange={(v) => updateField("anxiety_concentration", v)}
                                            />
                                        </div>
                                    )}

                                    {/* STEP 5: BURNOUT INDICATORS */}
                                    {step === 5 && (
                                        <div className="space-y-6">
                                            <Header title="Burnout Symptoms" desc="During placement preparation, to what extent do you experience the following?" />
                                            <LikertScale
                                                label="Reduced sleep quality"
                                                value={formData.burnout_sleep}
                                                onChange={(v) => updateField("burnout_sleep", v)}
                                            />
                                            <LikertScale
                                                label="Mental exhaustion even after rest"
                                                value={formData.burnout_exhaustion}
                                                onChange={(v) => updateField("burnout_exhaustion", v)}
                                            />
                                            <LikertScale
                                                label="Loss of motivation"
                                                value={formData.burnout_motivation}
                                                onChange={(v) => updateField("burnout_motivation", v)}
                                            />
                                            <LikertScale
                                                label="Physical fatigue or headaches"
                                                value={formData.burnout_physical}
                                                onChange={(v) => updateField("burnout_physical", v)}
                                            />
                                        </div>
                                    )}

                                    {/* STEP 6: PREPARATION HABITS */}
                                    {step === 6 && (
                                        <div className="space-y-8">
                                            <Header title="Your Preparation Routine" desc="No judgment—just honest tracking to help you understand patterns." />

                                            <div>
                                                <label className="text-sm font-medium mb-4 block">How many hours are you preparing daily?</label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[
                                                        { val: "low", label: "Light", desc: "< 2 hrs" },
                                                        { val: "moderate", label: "Moderate", desc: "3-5 hrs" },
                                                        { val: "high", label: "Heavy", desc: "6+ hrs" }
                                                    ].map((opt) => (
                                                        <TileOption
                                                            key={opt.val}
                                                            selected={formData.prep_hours === opt.val}
                                                            onClick={() => updateField("prep_hours", opt.val)}
                                                            label={opt.label}
                                                            sub={opt.desc}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium mb-4 block">How consistent have you been?</label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[
                                                        { val: "low", label: "Sporadic", desc: "Hard to stick to plan" },
                                                        { val: "moderate", label: "Okay", desc: "Missed some days" },
                                                        { val: "high", label: "Solid", desc: "Every single day" }
                                                    ].map((opt) => (
                                                        <TileOption
                                                            key={opt.val}
                                                            selected={formData.prep_consistency === opt.val}
                                                            onClick={() => updateField("prep_consistency", opt.val)}
                                                            label={opt.label}
                                                            sub={opt.desc}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 7: STRESS & COPING */}
                                    {step === 7 && (
                                        <div className="space-y-8">
                                            <Header title="How Are You Feeling?" desc="Your mental well-being matters as much as your preparation." />
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium">How stressed do you feel today?</span>
                                                    <span className="text-primary font-bold">{formData.stress}/10</span>
                                                </div>
                                                <Slider
                                                    value={formData.stress}
                                                    max={10}
                                                    onValueChange={(v) => updateField("stress", v)}
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                                    <span>Zen</span>
                                                    <span>Manageable</span>
                                                    <span>Panic</span>
                                                </div>
                                            </div>

                                            <SelectGroup
                                                label="What's your main coping strategy?"
                                                options={[
                                                    { val: "passive", label: "Distraction (Netflix, Sleeping)" },
                                                    { val: "active", label: "Talking, Exercise, Hobbies" },
                                                    { val: "nothing", label: "Nothing helps right now" },
                                                ]}
                                                value={formData.coping}
                                                onChange={(v) => updateField("coping", v)}
                                            />
                                        </div>
                                    )}

                                </motion.div>
                            </AnimatePresence>

                            <div className="flex justify-between pt-8 mt-4 border-t">
                                <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                                <Button onClick={handleNext} className="rounded-full px-8">
                                    {step === totalSteps ? "Get Insights" : "Next"}
                                    {step !== totalSteps && <ArrowRight className="ml-2 h-4 w-4" />}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

// Sub-components
function Header({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-1">{title}</h2>
            <p className="text-muted-foreground">{desc}</p>
        </div>
    )
}

function SelectGroup({ label, options, value, onChange }: { label: string, options: { val: string, label: string }[], value?: string, onChange: (v: string) => void }) {
    return (
        <div className="space-y-3">
            <label className="text-sm font-medium">{label}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((opt) => (
                    <div
                        key={opt.val}
                        onClick={() => onChange(opt.val)}
                        className={cn(
                            "cursor-pointer rounded-lg border p-3 transition-all hover:bg-muted/50 flex items-center justify-between",
                            value === opt.val ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-input"
                        )}
                    >
                        <span className="text-sm">{opt.label}</span>
                        {value === opt.val && <Check className="h-4 w-4 text-primary" />}
                    </div>
                ))}
            </div>
        </div>
    )
}

function TileOption({ label, sub, selected, onClick }: { label: string, sub: string, selected: boolean, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "cursor-pointer rounded-xl border p-4 text-center transition-all hover:bg-muted/50",
                selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-input"
            )}
        >
            <div className="font-semibold text-sm">{label}</div>
            <div className="text-xs text-muted-foreground mt-1">{sub}</div>
        </div>
    )
}

function LikertScale({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-start">
                <label className="text-sm font-medium flex-1">{label}</label>
                <span className="text-primary font-bold ml-4">{value}/5</span>
            </div>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                    <button
                        key={num}
                        onClick={() => onChange(num)}
                        className={cn(
                            "flex-1 h-12 rounded-lg border-2 transition-all font-semibold",
                            value === num
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input hover:border-primary/50"
                        )}
                    >
                        {num}
                    </button>
                ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
            </div>
        </div>
    )
}
