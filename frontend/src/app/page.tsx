import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header showNav={false} />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-foreground">
          Master Your Exams with
          <span className="block text-primary">AI-Powered Practice</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Comprehensive test preparation platform for competitive exams. Practice with real questions, 
          get instant feedback, and track your progress with advanced analytics.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/sign-up">
            <Button size="lg" className="px-8 py-3 text-lg">
              Start Free Trial
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Everything You Need to Succeed
          </h2>
          <p className="text-muted-foreground text-lg">
            Powerful features designed for serious exam preparation
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>📊 Smart Analytics</CardTitle>
              <CardDescription>
                Track your progress with detailed performance metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              Advanced reporting dashboard to identify strengths and weaknesses
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🧠 Adaptive Learning</CardTitle>
              <CardDescription>
                AI-powered question selection based on your performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              Personalized practice sessions that adapt to your learning pace
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📚 Comprehensive Content</CardTitle>
              <CardDescription>
                Extensive question banks for all major competitive exams
              </CardDescription>
            </CardHeader>
            <CardContent>
              UPSC, SSC, Banking, Railway, and more with regular updates
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2 text-primary">50K+</div>
              <div className="text-muted-foreground">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-primary">100K+</div>
              <div className="text-muted-foreground">Practice Questions</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-primary">95%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-primary">24/7</div>
              <div className="text-muted-foreground">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">247</span>
              </div>
              <span className="font-bold text-foreground">Exams</span>
            </div>
            <div className="text-muted-foreground text-sm">
              © 2024 247 Exams. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
