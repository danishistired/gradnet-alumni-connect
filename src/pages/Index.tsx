import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Users, TrendingUp, Award, Globe } from "lucide-react";
import { Logo } from "@/components/Logo";
import heroBg from "@/assets/hero-bg.jpg";


const Index = () => {
  const navigate = useNavigate();

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
            <Button 
              size="lg" 
              className="btn-accent text-lg px-8 py-3"
              onClick={() => navigate('/login')}
            >
              Join GradNet
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-3 border-2 hover:bg-accent-light"
              onClick={() => navigate('/about')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="py-16 px-4 bg-surface-muted">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-accent mb-2">10,000+</div>
              <div className="text-text-secondary">Active Members</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">500+</div>
              <div className="text-text-secondary">Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">50+</div>
              <div className="text-text-secondary">Countries</div>
            </div>
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
