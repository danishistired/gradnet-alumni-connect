import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Users, TrendingUp, Award, Globe } from "lucide-react";
import { Logo } from "@/components/Logo";
import heroBg from "@/assets/hero-bg.jpg";


const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Automatically redirect logged-in users to Feed
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/feed', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Logo className="justify-center mb-4 text-2xl" animated />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div 
        className="relative min-h-screen flex items-center justify-center px-4 gradient-bg pt-16"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Logo className="justify-center mb-8 text-4xl" animated />
          
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6 animate-fade-in">
            Connect. Learn. <span className="text-accent">Grow.</span>
          </h1>
          
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto animate-fade-in">
            The professional networking platform that bridges students and alumni. 
            Share knowledge, find mentors, and accelerate your career journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            {user ? (
              // Authenticated user - show dashboard button
              <Button 
                size="lg" 
                className="btn-accent text-lg px-8 py-3"
                onClick={() => navigate('/feed')}
              >
                Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              // Guest user - show join/login buttons
              <>
                <Button 
                  size="lg" 
                  className="btn-accent text-lg px-8 py-3"
                  onClick={() => navigate('/register')}
                >
                  Join GradNet
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-3 border-2 hover:bg-accent-light"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600"
                  onClick={() => navigate('/cu-questions')}
                >
                  Ask Questions to CU Community
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => navigate('/about')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Join the community that's shaping the future of professional networking
          </p>
          <Button 
            size="lg" 
            className="btn-accent text-lg px-8 py-3"
            onClick={() => navigate('/login')}
          >
            Get Started Today
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
