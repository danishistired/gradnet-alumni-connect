import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, GraduationCap, User, Upload, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import PixelBlast from '@/components/PixelBlast';
import GlassSurface from '@/components/GlassSurface';

export const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "student" as "student" | "alumni",
    university: "",
    graduationYear: "",
    agreeToTerms: false,
    proofDocument: null as File | null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access before registration
  const from = location.state?.from?.pathname || '/skill-selection';

  const handleInputChange = (field: string, value: string | boolean | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isValidEmail = (email: string, accountType: string) => {
    if (accountType === 'student') {
      return email.endsWith('@cuchd.in');
    }
    // For alumni, any valid email format is allowed
    return email.includes('@') && email.includes('.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("Please accept the terms and conditions");
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
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        accountType: formData.accountType,
        university: formData.university,
        graduationYear: formData.graduationYear
      });
      
      if (result.success) {
        // Redirect to skill selection by default for new users
        navigate(from, { replace: true });
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
                    placeholder={formData.accountType === 'student' ? 'john.doe@cuchd.in' : 'john.doe@email.com'}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`${formData.accountType === 'student' && formData.email && !isValidEmail(formData.email, formData.accountType) ? 'border-red-500' : ''}`}
                    required
                  />
                  {formData.accountType === 'student' && formData.email && !isValidEmail(formData.email, formData.accountType) && (
                    <p className="text-sm text-red-500 mt-1">Students must use their @cuchd.in email address</p>
                  )}
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
                        <User className="w-4 h-4" />
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
                  <Input
                    id="graduationYear"
                    type="text"
                    placeholder="2023"
                    value={formData.graduationYear}
                    onChange={(e) => handleInputChange("graduationYear", e.target.value)}
                    required
                  />
                </div>

                {/* Alumni Proof Document Upload */}
                {formData.accountType === "alumni" && (
                  <div className="space-y-2">
                    <Label htmlFor="proofDocument">
                      Alumni Verification Document
                    </Label>
                    <div className="space-y-1">
                      <div className="relative">
                        <Input
                          id="proofDocument"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files ? e.target.files[0] : null;
                            handleInputChange("proofDocument", file);
                          }}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-foreground hover:file:bg-accent-hover"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-600">
                        Upload proof of graduation (degree certificate, transcript, alumni ID card, etc.). 
                        Supported formats: PDF, JPG, PNG, DOC. Max size: 5MB.
                      </p>
                      {formData.proofDocument && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <FileText className="w-4 h-4" />
                          <span>{formData.proofDocument.name}</span>
                          <span className="text-gray-500">
                            ({(formData.proofDocument.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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

                {error && (
                  <p className="text-sm text-red-500 text-center">
                    {error}
                  </p>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full btn-accent"
                  disabled={!formData.agreeToTerms || isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="my-4 text-center">
                <span className="text-sm text-text-secondary">or</span>
              </div>

              {/* Google Sign-In Button (Optional) */}
              <div className="flex justify-center">
                {/* <Button variant="outline" className="w-full max-w-xs">
                  <Google className="w-4 h-4 mr-2" />
                  Sign up with Google
                </Button> */}
              </div>

              <div className="my-4 text-center">
                <span className="text-sm text-text-secondary">Already have an account?</span>
                <Link to="/login" className="text-accent hover:underline font-medium">
                  Sign in here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Register;
