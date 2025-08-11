import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { HelpCircle, Users, MessageSquare } from "lucide-react";

export const ProspectiveLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthState } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          accountType: 'prospective'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Set authentication state
        setAuthState(data.user, data.token);
        
        // Redirect to CU questions page
        navigate('/cu-questions');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <HelpCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Welcome Back!
            </h1>
            <p className="text-text-secondary">
              Sign in to your prospective student account to ask questions and interact with the CU community
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign In to CU Community</CardTitle>
              <CardDescription>
                Access your prospective student account to continue asking questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-4">
                <div className="text-sm text-text-secondary">
                  Don't have a prospective student account?
                </div>
                <Link to="/prospective-student">
                  <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                    Create Prospective Student Account
                  </Button>
                </Link>
                
                <div className="pt-4 border-t">
                  <div className="text-sm text-text-secondary mb-3">
                    Are you a current CU student or alumni?
                  </div>
                  <Link to="/login">
                    <Button variant="ghost" className="w-full">
                      Sign In as Student/Alumni
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                What you can do as a prospective student:
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Ask questions about CU programs, campus life, and admissions
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Get answers from current students and alumni
                </li>
                <li className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Learn about student experiences and opportunities
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
