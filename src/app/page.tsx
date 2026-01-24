import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { ArrowRight, BarChart2, Heart, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:leading-[1.1]">
              A Calmer Path to <span className="text-primary">Placement Success</span>
            </h1>
            <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
              Placement season is tough. We help you track your progress, manage stress,
              and find sustainable strategies. You are not alone in this journey.
            </p>
            <div className="flex gap-4 mt-6">
              <Link href="/check-in">
                <Button size="lg" className="rounded-full px-8">
                  Start Daily Check-in <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/guide">
                <Button variant="outline" size="lg" className="rounded-full px-8">
                  View Guidance
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-none shadow-sm bg-background/60 backdrop-blur-sm">
              <CardHeader>
                <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary mb-2">
                  <Heart className="h-6 w-6" />
                </div>
                <CardTitle>Emotional Wellness</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-foreground/80">
                  Reflect on your stress levels and burnout. Get personalized advice based on how you feel, not just what you study.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-background/60 backdrop-blur-sm">
              <CardHeader>
                <div className="p-2 w-fit rounded-lg bg-secondary/10 text-secondary mb-2">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <CardTitle>Data-Backed Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-foreground/80">
                  See patterns from thousands of students. Understand that your struggles are normal and structural.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-background/60 backdrop-blur-sm">
              <CardHeader>
                <div className="p-2 w-fit rounded-lg bg-accent text-accent-foreground mb-2">
                  <Shield className="h-6 w-6" />
                </div>
                <CardTitle>Stage Specific Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-foreground/80">
                  From online tests to HR rounds, get guidance that matters for exactly where you are in the process.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
