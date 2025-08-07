import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { GraduationCap, Users, MessageCircle, TrendingUp } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: GraduationCap,
      title: "Alumni Expertise",
      description: "Learn from graduates working at top companies worldwide"
    },
    {
      icon: Users,
      title: "Student Community",
      description: "Connect with peers and build lasting professional relationships"
    },
    {
      icon: MessageCircle,
      title: "Knowledge Sharing",
      description: "Share insights, ask questions, and grow together"
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description: "Get mentorship and advice for your professional journey"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative min-h-screen flex items-center justify-center px-4 gradient-bg"
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
              onClick={() => navigate('/feed')}
            >
              Explore Posts
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Why Choose GradNet?
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Join thousands of students and alumni building meaningful professional connections
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="card-elevated text-center animate-fade-in">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-surface-muted">
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
