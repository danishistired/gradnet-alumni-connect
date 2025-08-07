import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GraduationCap, User } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

type UserType = 'student' | 'alumni' | null;

export default function Login() {
  const [selectedType, setSelectedType] = useState<UserType>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedType === 'student') {
      navigate('/skill-selection');
    } else if (selectedType === 'alumni') {
      navigate('/verify');
    }
  };

  const isUniversityEmail = (email: string) => {
    return email.includes('.edu') || email.includes('@university') || email.includes('@college');
  };

  const showEmailError = selectedType === 'student' && email && !isUniversityEmail(email);

  return (
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
          {!selectedType ? (
            <div className="space-y-4">
              <p className="text-center text-text-secondary text-sm">Choose your account type</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 hover:border-accent hover:bg-accent-light"
                  onClick={() => setSelectedType('student')}
                >
                  <GraduationCap className="w-6 h-6 text-accent" />
                  <span className="font-medium">Student</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 hover:border-accent hover:bg-accent-light"
                  onClick={() => setSelectedType('alumni')}
                >
                  <User className="w-6 h-6 text-accent" />
                  <span className="font-medium">Alumni</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-slide-up">
              <div className="text-center mb-4">
                <h2 className="text-lg font-medium text-text-primary">
                  Sign in as {selectedType === 'student' ? 'Student' : 'Alumni'}
                </h2>
                {selectedType === 'alumni' && (
                  <p className="text-sm text-text-secondary mt-1">
                    Use your personal email—university access is disabled after graduation
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <Input
                    type="email"
                    placeholder={selectedType === 'student' ? 'your.name@university.edu' : 'your.email@gmail.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`input-field ${showEmailError ? 'border-accent' : ''}`}
                  />
                  {showEmailError && (
                    <p className="text-sm text-accent mt-1">Please use your university email address</p>
                  )}
                </div>
                
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                />
              </div>
              
              <div className="space-y-3">
                <Button 
                  className="w-full btn-accent" 
                  onClick={handleContinue}
                  disabled={!email || !password || showEmailError}
                >
                  Continue as {selectedType === 'student' ? 'Student' : 'Alumni'}
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full text-text-secondary" 
                  onClick={() => setSelectedType(null)}
                >
                  ← Back to account type
                </Button>
              </div>
            </div>
          )}
          
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
  );
}