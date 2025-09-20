import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Eye, EyeOff, GraduationCap, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import GlassSurface from '@/components/GlassSurface';
import LightRays from '@/components/LightRays';
import heroBg from "@/assets/hero-bg.jpg";

export const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    accountType: "student" as "student" | "alumni"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access before login
  const from = location.state?.from?.pathname || '/feed';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    // Email validation
    if (!isValidEmail(formData.email, formData.accountType)) {
      setError(
        formData.accountType === "student" 
          ? "Students must use their @cuchd.in email address"
          : "Please enter a valid email address"
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(formData.email, formData.password, formData.accountType);
      
      if (result.success) {
        // Redirect to the page user was trying to access, or to feed by default
        navigate(from, { replace: true });
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string, accountType: string) => {
    if (accountType === 'student') {
      return email.endsWith('@cuchd.in');
    }
    // For alumni, any valid email format is allowed
    return email.includes('@') && email.includes('.');
  };

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* LightRays Background */}
      <div className="fixed inset-0 z-1">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays w-full h-full"
        />
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10">
        <Navbar />
        
        {/* Login Section */}
        <div className="min-h-screen flex items-center justify-center px-4 pt-24">
          <GlassSurface 
            width={450} 
            height={600}
            borderRadius={24}
            displace={15}
            distortionScale={-150}
            redOffset={5}
            greenOffset={15}
            blueOffset={25}
            brightness={60}
            opacity={0.8}
            mixBlendMode="screen"
            className="w-full max-w-md"
          >
            <div className="p-8 h-full flex flex-col justify-center">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-white/70">Sign in to your GradNet account</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-center text-white/70 text-sm">Choose your account type</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className={`h-16 flex flex-col gap-2 bg-transparent border-white/30 text-white hover:bg-white/20 ${
                        formData.accountType === 'student' ? 'bg-white/20 border-white/50' : ''
                      }`}
                      onClick={() => setFormData({ ...formData, accountType: 'student' })}
                    >
                      <GraduationCap className="w-5 h-5" />
                      <span className="font-medium">Student</span>
                    </Button>
                    <Button
                      variant="outline"
                      className={`h-16 flex flex-col gap-2 bg-transparent border-white/30 text-white hover:bg-white/20 ${
                        formData.accountType === 'alumni' ? 'bg-white/20 border-white/50' : ''
                      }`}
                      onClick={() => setFormData({ ...formData, accountType: 'alumni' })}
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Alumni</span>
                    </Button>
                  </div>
                </div>
             </div>         
              
              <div className="text-center mb-4">
                <h2 className="text-lg font-medium text-white">
                  Sign in as {formData.accountType === 'student' ? 'Student' : 'Alumni'}
                </h2>
                {formData.accountType === 'alumni' && (
                  <p className="text-sm text-white/70 mt-1">
                    Use your personal email—university access is disabled after graduation
                  </p>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder={formData.accountType === 'student' ? 'your.name@cuchd.in' : 'your.email@gmail.com'}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-transparent border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                  />
                  {error && (
                    <p className="text-sm text-red-400 mt-1">{error}</p>
                  )}
                </div>
                
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-transparent border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-white/60" />
                    ) : (
                      <Eye className="w-5 h-5 text-white/60" />
                    )}
                  </button>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              
              <div className="text-center">
                <p className="text-white/70 text-sm">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-white hover:text-white/80 font-medium">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </GlassSurface>
        </div>
      </div>
    </div>
  );
};