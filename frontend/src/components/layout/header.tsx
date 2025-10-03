import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  showAuth?: boolean;
  showNav?: boolean;
}

export function Header({ showAuth = true, showNav = true }: HeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">247</span>
            </div>
            <span className="text-xl font-bold text-foreground">Exams</span>
          </Link>
          
          {showNav && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/exams" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Exams
              </Link>
              <Link href="/practice" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Practice
              </Link>
              <Link href="/results" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Results
              </Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Pricing
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                About
              </Link>
            </nav>
          )}

          {showAuth && (
            <div className="flex items-center space-x-4">
              <Link href="/auth/sign-in">
                <Button variant="ghost">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button>
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}