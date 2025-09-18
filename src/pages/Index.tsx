import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Users, TrendingUp, Award, Globe } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import heroBg from "@/assets/hero-bg.jpg";
import MagicBento from '@/components/MagicBento'
import ScrambledText from '@/components/ScrambledText';
import PixelBlast from '@/components/PixelBlast';
import GlassSurface from '@/components/GlassSurface';
import CardSwap, { Card as SwapCard } from '@/components/CardSwap';





const Index = () => {
  const navigate = useNavigate();
  const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
  { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
  { label: 'Services', ariaLabel: 'View our services', link: '/services' },
  { label: 'Contact', ariaLabel: 'Get in touch', link: '/contact' }
  ];
  const socialItems = [
  { label: 'Twitter', link: 'https://twitter.com' },
  { label: 'GitHub', link: 'https://github.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' }
  ];
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
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* PixelBlast Background */}
      <div className="absolute inset-0 z-0">
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#B19EEF"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent
        />
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10">
        <Navbar />
      
      {/* Hero Section */}
      
      <div 
        className="relative min-h-screen flex items-start justify-between px-8 pt-40"
      >
        
        {/* Left Column - Main Content */}
        <div className="relative z-10 max-w-4xl text-left flex-1 pr-8" style={{ marginTop: '100px' }}>
          <h1 className="text-9xl md:text-[12rem] font-bold text-white mb-8 animate-fade-in">
            GRADNET
          </h1>
          
          <div className="text-xl text-white mb-8 max-w-2xl animate-fade-in">
            <ScrambledText
              className="scrambled-text-demo"
              radius={100}
              duration={1.2}
              speed={0.5}
              scrambleChars=".:"
            >
              The professional networking platform that bridges students and alumni. 
              Share knowledge, find mentors, and accelerate your career journey.
            </ScrambledText>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
            {user ? (
              // Authenticated user - show dashboard button
              <GlassSurface 
                width={250} 
                height={60}
                borderRadius={24}
                displace={15}
                distortionScale={-150}
                redOffset={5}
                greenOffset={15}
                blueOffset={25}
                brightness={60}
                opacity={0.8}
                mixBlendMode="screen"
              >
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-3 text-white w-full h-full bg-transparent border-none hover:bg-transparent"
                  onClick={() => navigate('/feed')}
                >
                  Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </GlassSurface>
            ) : (
              // Guest user - show join/login buttons
              <>
                <GlassSurface 
                  width={200} 
                  height={60}
                  borderRadius={24}
                  displace={15}
                  distortionScale={-150}
                  redOffset={5}
                  greenOffset={15}
                  blueOffset={25}
                  brightness={60}
                  opacity={0.8}
                  mixBlendMode="screen"
                >
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-3 text-white w-full h-full bg-transparent border-none hover:bg-transparent"
                    onClick={() => navigate('/register')}
                  >
                    Join GradNet
                  </Button>
                </GlassSurface>
                <GlassSurface 
                  width={150} 
                  height={60}
                  borderRadius={24}
                  displace={15}
                  distortionScale={-150}
                  redOffset={5}
                  greenOffset={15}
                  blueOffset={25}
                  brightness={60}
                  opacity={0.8}
                  mixBlendMode="screen"
                >
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-3 text-white w-full h-full bg-transparent border-none hover:bg-transparent"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                </GlassSurface>
                <GlassSurface 
                  width={300} 
                  height={60}
                  borderRadius={24}
                  displace={15}
                  distortionScale={-150}
                  redOffset={5}
                  greenOffset={15}
                  blueOffset={25}
                  brightness={60}
                  opacity={0.8}
                  mixBlendMode="screen"
                >
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-3 text-white w-full h-full bg-transparent border-none hover:bg-transparent"
                    onClick={() => navigate('/cu-questions')}
                  >
                    Ask Questions to CU Community
                  </Button>
                </GlassSurface>
              </>
            )}
            <GlassSurface 
              width={180} 
              height={60}
              borderRadius={24}
              displace={15}
              distortionScale={-150}
              redOffset={5}
              greenOffset={15}
              blueOffset={25}
              brightness={60}
              opacity={0.8}
              mixBlendMode="screen"
            >
              <Button 
                size="lg" 
                className="text-lg px-8 py-3 text-white w-full h-full bg-transparent border-none hover:bg-transparent"
                onClick={() => navigate('/about')}
              >
                Learn More
              </Button>
            </GlassSurface>
          </div>
        </div>

        {/* Right Column - CardSwap */}
        <div className="relative z-10 flex-shrink-0" style={{ width: '400px', marginTop: '-100px' }}>
          <div style={{ height: '600px', position: 'relative' }}>
            <CardSwap
              cardDistance={60}
              verticalDistance={70}
              delay={5000}
              pauseOnHover={false}
            >
              <SwapCard>
                <div className="p-6 text-white">
                  <h3 className="text-2xl font-bold mb-4">Connect</h3>
                  <p className="text-white/80">Build meaningful connections with alumni and fellow students in your field.</p>
                </div>
              </SwapCard>
              <SwapCard>
                <div className="p-6 text-white">
                  <h3 className="text-2xl font-bold mb-4">Learn</h3>
                  <p className="text-white/80">Share knowledge and learn from experienced professionals in your industry.</p>
                </div>
              </SwapCard>
              <SwapCard>
                <div className="p-6 text-white">
                  <h3 className="text-2xl font-bold mb-4">Grow</h3>
                  <p className="text-white/80">Accelerate your career journey with mentorship and networking opportunities.</p>
                </div>
              </SwapCard>
            </CardSwap>
          </div>
        </div>
      </div>
      
      
      {/* MagicBento Section */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <MagicBento 
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={12}
            glowColor="132, 0, 255"
          />
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
      
      {/* Footer */}
      <Footer />
      </div>
    </div>
  );
};

export default Index;
