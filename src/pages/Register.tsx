import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { Eye, EyeOff, GraduationCap, Briefcase } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "",
    university: "",
    graduationYear: "",
    currentCompany: "",
    agreeToTerms: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions!");
      return;
    }

    // TODO: Implement actual registration logic
    console.log("Registration data:", formData);
    
    // Navigate to skill selection or next step
    navigate("/skill-selection");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />
      
      {/* Registration Form */}
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <Card className="card-elevated">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-text-primary">
                Join GradNet
              </CardTitle>
              <CardDescription className="text-text-secondary">
                Create your account and start connecting with the community
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@university.edu"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                {/* Account Type */}
                <div className="space-y-3">
                  <Label>I am a:</Label>
                  <RadioGroup
                    value={formData.accountType}
                    onValueChange={(value) => handleInputChange("accountType", value)}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student" className="flex items-center gap-2 cursor-pointer">
                        <GraduationCap className="w-4 h-4" />
                        Current Student
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="alumni" id="alumni" />
                      <Label htmlFor="alumni" className="flex items-center gap-2 cursor-pointer">
                        <Briefcase className="w-4 h-4" />
                        Alumni/Graduate
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* University */}
                <div className="space-y-2">
                  <Label htmlFor="university">University/Institution</Label>
                  <Input
                    id="university"
                    type="text"
                    placeholder="University of Technology"
                    value={formData.university}
                    onChange={(e) => handleInputChange("university", e.target.value)}
                    required
                  />
                </div>

                {/* Graduation Year */}
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">
                    {formData.accountType === "student" ? "Expected Graduation Year" : "Graduation Year"}
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("graduationYear", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i - 5;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Current Company (for alumni) */}
                {formData.accountType === "alumni" && (
                  <div className="space-y-2">
                    <Label htmlFor="currentCompany">Current Company (Optional)</Label>
                    <Input
                      id="currentCompany"
                      type="text"
                      placeholder="Tech Company Inc."
                      value={formData.currentCompany}
                      onChange={(e) => handleInputChange("currentCompany", e.target.value)}
                    />
                  </div>
                )}

                <Separator />

                {/* Password Fields */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-text-secondary" />
                      ) : (
                        <Eye className="h-4 w-4 text-text-secondary" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-text-secondary" />
                      ) : (
                        <Eye className="h-4 w-4 text-text-secondary" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm text-text-secondary cursor-pointer">
                    I agree to the{" "}
                    <Link to="/terms" className="text-accent hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-accent hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full btn-accent"
                  disabled={!formData.agreeToTerms}
                >
                  Create Account
                </Button>
              </form>

              <Separator className="my-6" />

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-text-secondary">
                  Already have an account?{" "}
                  <Link to="/login" className="text-accent hover:underline font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
