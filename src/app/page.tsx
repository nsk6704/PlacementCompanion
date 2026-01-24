"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { ArrowRight, BarChart2, Heart, Shield, Sparkles, Smile, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 relative">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-[float_6s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] animate-[float_8s_ease-in-out_infinite_reverse]" />
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 sm:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto flex max-w-[980px] flex-col items-center gap-6 text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Your Placement Companion
            </motion.div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl md:text-7xl lg:leading-[1.1]">
              Placement Prep <br />
              <span className="text-primary relative inline-block">
                Doesn't Have to Hurt
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-secondary z-[-1]" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" opacity="0.5" />
                </svg>
              </span>
            </h1>

            <p className="max-w-[750px] text-lg text-muted-foreground sm:text-2xl leading-relaxed">
              We help you track your <span className="text-foreground font-semibold">progress</span>, manage <span className="text-foreground font-semibold">stress</span>,
              and find <span className="text-foreground font-semibold">balance</span>. Because a calm mind performs better.
            </p>

            <motion.div
              className="flex gap-4 mt-8 flex-col sm:flex-row w-full sm:w-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/check-in">
                <Button size="lg" className="px-8 text-lg h-14 w-full sm:w-auto shadow-lg hover:shadow-xl shadow-primary/20">
                  Start Daily Check-in <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/guide">
                <Button variant="outline" size="lg" className="px-8 text-lg h-14 w-full sm:w-auto border-2">
                  Explore Guidance
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-24">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Heart className="h-8 w-8 text-rose-500" />}
              title="Emotional Wellness"
              desc="Reflect on your stress levels. Get personalized advice based on how you feel, not just what you study."
              delay={0.2}
              color="bg-rose-50"
            />
            <FeatureCard
              icon={<BarChart2 className="h-8 w-8 text-blue-500" />}
              title="Data-Backed Insights"
              desc="See patterns from thousands of students. Understand that your struggles are normal and structural."
              delay={0.4}
              color="bg-blue-50"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-amber-500" />}
              title="Stage Specific Support"
              desc="From online tests to HR rounds, get guidance that matters for exactly where you are in the process."
              delay={0.6}
              color="bg-amber-50"
            />
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="container mx-auto px-4 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-primary/5 rounded-3xl p-12 border border-primary/10 relative overflow-hidden"
          >
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-6">
                <Smile className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Ready to feel better?</h2>
              <p className="text-lg text-muted-foreground">
                Join your peers who are choosing a healthier way to prepare.
              </p>
              <Link href="/check-in">
                <Button variant="secondary" size="lg" className="mt-4 px-10 text-lg">
                  Let's Begin <Zap className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay, color }: { icon: React.ReactNode, title: string, desc: string, delay: number, color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Card className="h-full border-none shadow-sm hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <div className={`p-4 w-fit rounded-2xl ${color} mb-4`}>
            {icon}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base text-muted-foreground/80 leading-relaxed">
            {desc}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  )
}
