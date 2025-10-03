import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { 
  CheckCircle, 
  Zap, 
  Play, 
  CreditCard, 
  Shield, 
  Star,
  Filter,
  BarChart3,
  Lightbulb,
  Archive,
  Smartphone,
  Target,
  Trophy,
  MessageCircle,
  Users
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header showNav={false} />

      {/* Hero Section */}
      <section className="bg-white">
        <div className="container mx-auto px-6 py-24 text-center">
          <Badge className="mb-6 px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 border-blue-200">
            <Users className="w-4 h-4 mr-2" />
            Trusted by 50,000+ Students
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
            Master Your Exams with
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mt-2">
              247Exams AI Platform
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Comprehensive test preparation platform for competitive exams. Practice with real questions, 
            get instant feedback, and track your progress with advanced analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/sign-up">
              <Button className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Zap className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
            </Link>
            <Button variant="outline" className="px-8 py-4 text-lg font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-orange-500 fill-current" />
              <span>4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2 text-sm font-medium bg-purple-50 text-purple-700 border-purple-200">
              <Filter className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Excel
              </span>
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Advanced tools and AI-powered insights designed to maximize your exam performance
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Smart Analytics
                </CardTitle>
                <CardDescription className="text-gray-600">
                  AI-powered insights that identify your strengths and improvement areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Performance trend analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Subject-wise breakdown
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Predictive scoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Adaptive Learning
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Personalized question selection that adapts to your learning style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    AI-curated practice sets
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    Difficulty adjustment
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    Smart recommendations
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                  <Archive className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Vast Question Bank
                </CardTitle>
                <CardDescription className="text-gray-600">
                  100,000+ questions covering all major competitive exams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    UPSC, SSC, Banking, Railway
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Regular updates
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Previous year papers
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">Instant Results</h3>
              <p className="text-sm text-gray-600">Get immediate feedback and explanations</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">Mobile Friendly</h3>
              <p className="text-sm text-gray-600">Practice anywhere, anytime on any device</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">Goal Tracking</h3>
              <p className="text-sm text-gray-600">Set targets and monitor progress</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">Leaderboards</h3>
              <p className="text-sm text-gray-600">Compete with peers nationwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Trusted by{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Thousands
              </span>
            </h2>
            <p className="text-gray-600 text-lg">Our numbers speak for themselves</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-4xl font-bold mb-2 text-gray-900">50K+</div>
                <div className="text-gray-600 font-medium mb-1">Active Students</div>
                <div className="text-green-600 text-sm">+16% this month</div>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-4xl font-bold mb-2 text-gray-900">100K+</div>
                <div className="text-gray-600 font-medium mb-1">Practice Questions</div>
                <div className="text-green-600 text-sm">+3% weekly</div>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-4xl font-bold mb-2 text-gray-900">95%</div>
                <div className="text-gray-600 font-medium mb-1">Success Rate</div>
                <div className="text-green-600 text-sm">+9% improvement</div>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-4xl font-bold mb-2 text-gray-900">24/7</div>
                <div className="text-gray-600 font-medium mb-1">Support Available</div>
                <div className="text-blue-600 text-sm">Always online</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2 text-sm font-medium bg-green-50 text-green-700 border-green-200">
              <MessageCircle className="w-4 h-4 mr-2" />
              Success Stories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              What Our{" "}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Students Say
              </span>
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Real stories from candidates who achieved their dreams
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {"★".repeat(5)}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 italic leading-relaxed">
                  "247 Exams transformed my preparation strategy. The AI-powered analytics helped me identify weak areas and improve my score by 40 points!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    R
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Rahul Sharma</div>
                    <div className="text-sm text-gray-500">UPSC CSE 2024 - Rank 45</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {"★".repeat(5)}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 italic leading-relaxed">
                  "The adaptive learning feature is incredible. It personalized my practice sessions and helped me clear SSC CGL in my first attempt."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    P
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Priya Patel</div>
                    <div className="text-sm text-gray-500">SSC CGL 2024 - Selected</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {"★".repeat(5)}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 italic leading-relaxed">
                  "Best investment in my career! The comprehensive question bank and instant feedback made all the difference in my banking exam preparation."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Amit Kumar</div>
                    <div className="text-sm text-gray-500">SBI PO 2024 - Selected</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-24">
        <div className="container mx-auto px-6 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Ace Your Exams?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join 50,000+ successful candidates and start your journey today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button className="px-10 py-4 text-lg font-semibold bg-white text-blue-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300">
                <Zap className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
            </Link>
            <Button variant="outline" className="px-10 py-4 text-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300">
              <MessageCircle className="w-5 h-5 mr-2" />
              Talk to Expert
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">247</span>
                </div>
                <span className="text-xl font-bold text-gray-900">247Exams</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Empowering students to achieve their dreams through AI-powered exam preparation.
              </p>
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white cursor-pointer hover:bg-blue-600 transition-colors">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white cursor-pointer hover:bg-sky-600 transition-colors">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white cursor-pointer hover:bg-pink-600 transition-colors">
                  <span className="text-sm">i</span>
                </div>
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white cursor-pointer hover:bg-red-600 transition-colors">
                  <span className="text-sm">y</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/exams" className="hover:text-blue-600 transition-colors">Browse Exams</Link></li>
                <li><Link href="/practice" className="hover:text-blue-600 transition-colors">Practice Tests</Link></li>
                <li><Link href="/analytics" className="hover:text-blue-600 transition-colors">Performance Analytics</Link></li>
                <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing Plans</Link></li>
                <li><Link href="/blog" className="hover:text-blue-600 transition-colors">Study Blog</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/help" className="hover:text-blue-600 transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-blue-600 transition-colors">FAQ</Link></li>
                <li><Link href="/tutorials" className="hover:text-blue-600 transition-colors">Video Tutorials</Link></li>
                <li><Link href="/community" className="hover:text-blue-600 transition-colors">Community Forum</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-blue-600 transition-colors">Careers</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-blue-600 transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 text-sm mb-4 md:mb-0">
              © 2024 247Exams. All rights reserved. Made with ❤️ in India.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>All systems operational</span>
              </div>
              <Link href="/status" className="hover:text-blue-600 transition-colors">Status Page</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
