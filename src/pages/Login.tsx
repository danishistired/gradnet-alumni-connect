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
    <div className="min-h-screen">
      {/* Main login area */}
      <div 
        className="min-h-screen flex items-center justify-center px-4 gradient-bg"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
        
        <Card className="w-full max-w-md relative z-10 card-elevated animate-fade-in">
        <CardHeader className="text-center pb-4">
          <Logo className="justify-center mb-4" animated />
          <h1 className="text-2xl font-semibold text-text-primary">Welcome to GradNet</h1>
          <p className="text-text-secondary">Connect, learn, and grow together</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-center text-text-secondary text-sm">Choose your account type</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 hover:border-accent hover:bg-accent-light"
                onClick={() => setFormData({ ...formData, accountType: 'student' })}
              >
                <GraduationCap className="w-6 h-6 text-accent" />
                <span className="font-medium">Student</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 hover:border-accent hover:bg-accent-light"
                onClick={() => setFormData({ ...formData, accountType: 'alumni' })}
              >
                <User className="w-6 h-6 text-accent" />
                <span className="font-medium">Alumni</span>
              </Button>
            </div>
          </div>
          
          <div className="space-y-4 animate-slide-up">
            <div className="text-center mb-4">
              <h2 className="text-lg font-medium text-text-primary">
                Sign in as {formData.accountType === 'student' ? 'Student' : 'Alumni'}
              </h2>
              {formData.accountType === 'alumni' && (
                <p className="text-sm text-text-secondary mt-1">
                  Use your personal email—university access is disabled after graduation
                </p>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Input
                  type="email"
                  placeholder={formData.accountType === 'student' ? 'your.name@cuchd.in' : 'your.email@gmail.com'}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`input-field ${error && 'border-accent'}`}
                />
                {error && (
                  <p className="text-sm text-accent mt-1">{error}</p>
                )}
              </div>
              
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-text-secondary" />
                  ) : (
                    <Eye className="w-5 h-5 text-text-secondary" />
                  )}
                </button>
              </div>
              
              <div className="space-y-3">
                <Button 
                  className="w-full btn-accent" 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : `Continue as ${formData.accountType === 'student' ? 'Student' : 'Alumni'}`}
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full text-text-secondary" 
                  onClick={() => setFormData({ ...formData, accountType: formData.accountType === 'student' ? 'alumni' : 'student' })}
                >
                  ← Back to account type
                </Button>
              </div>
            </form>
          </div>
          
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-text-muted">
              Don't have an account?{" "}
              <button className="text-accent hover:underline font-medium">
                Register
              </button>
            </p>
            <p className="text-xs text-text-muted mt-2">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};