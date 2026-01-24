"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/lib/insightsEngine";

export default function CheckInPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<UserProfile>({
        stress: 5,
        prepHours: "moderate",
        prepConsistency: "moderate",
        department: "",
        cgpa: "",
        stage: "",
        coping: "",
    });

    const totalSteps = 4;

    // Check auth on mount
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
        router.push('/login');
    }

    const { apiRequest } = require("@/lib/api"); // Lazy load to avoid server-side issues if any

    const handleNext = async () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            try {
                // Prepare data for backend (snake_case conversion if needed, but our model uses snake_case keys in backend too? 
                // Let's check model: department, cgpa, stage, prep_hours, prep_consistency, stress, coping)
                const payload = {
                    department: formData.department,
                    cgpa: formData.cgpa,
                    stage: formData.stage,
                    prep_hours: formData.prepHours,
                    prep_consistency: formData.prepConsistency,
                    stress: formData.stress,
                    coping: formData.coping
                };

                await apiRequest("/check-in", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });

                // Convert collected data into query params for the results page
                const params = new URLSearchParams();
                Object.entries(formData).forEach(([key, value]) => {
                    if (value) params.append(key, String(value));
                });
                router.push(`/check-in/results?${params.toString()}`);
            } catch (error) {
                console.error("Failed to submit check-in:", error);
                // Optionally show error to user
            }
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    }

    const updateField = (field: keyof UserProfile, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
                        <p className="text-muted-foreground">A quick reflection to track your journey and get personalized insights.</p>
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
                                                label="Which department are you in?"
                                                options={[
                                                    { val: "CS/IT", label: "CS / IT" },
                                                    { val: "ELECTRICAL/ELECTRONICS", label: "Electrical / Electronics" },
                                                    { val: "MECHANICAL", label: "Mechanical" },
                                                    { val: "OTHER", label: "Other" },
                                                ]}
                                                value={formData.department}
                                                onChange={(v) => updateField("department", v)}
                                            />
                                            <SelectGroup
                                                label="What's your current CGPA range?"
                                                options={[
                                                    { val: "<7", label: "Below 7" },
                                                    { val: "7-8", label: "7 - 8" },
                                                    { val: "8-9", label: "8 - 9" },
                                                    { val: "9+", label: "9+" },
                                                ]}
                                                value={formData.cgpa}
                                                onChange={(v) => updateField("cgpa", v)}
                                            />
                                        </div>
                                    )}

                                    {/* STEP 2: PLACEMENT STAGE */}
                                    {step === 2 && (
                                        <div className="space-y-6">
                                            <Header title="Placement Journey Stage" desc="Where are you in the placement process right now?" />
                                            <SelectGroup
                                                label="What stage are you at?"
                                                options={[
                                                    { val: "online_tests", label: "Online Tests / Assessments" },
                                                    { val: "technical_interviews", label: "Technical Interviews" },
                                                    { val: "hr_round", label: "HR Round" },
                                                    { val: "still_applying", label: "Still Applying (No responses)" },
                                                ]}
                                                value={formData.stage}
                                                onChange={(v) => updateField("stage", v)}
                                            />
                                        </div>
                                    )}

                                    {/* STEP 3: HABITS */}
                                    {step === 3 && (
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
                                                            selected={formData.prepHours === opt.val}
                                                            onClick={() => updateField("prepHours", opt.val)}
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
                                                            selected={formData.prepConsistency === opt.val}
                                                            onClick={() => updateField("prepConsistency", opt.val)}
                                                            label={opt.label}
                                                            sub={opt.desc}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 4: EMOTION */}
                                    {step === 4 && (
                                        <div className="space-y-8">
                                            <Header title="How Are You Feeling?" desc="Your mental well-being matters as much as your preparation." />
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium">How stressed do you feel today?</span>
                                                    <span className="text-primary font-bold">{formData.stress}/10</span>
                                                </div>
                                                <Slider
                                                    value={formData.stress || 5}
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

// Sub-components for cleaner code
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
