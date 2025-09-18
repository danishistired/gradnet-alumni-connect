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
import LightRays from '@/components/LightRays';

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
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* PixelBlast Background */}
      <div className="fixed inset-0 z-0">
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
      
      {/* LightRays Background */}
      <div className="fixed inset-0 z-1">
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
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
        
        {/* Register Section */}
        <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-8">
          <GlassSurface 
            width={500} 
            height={700}
            borderRadius={24}
            displace={15}
            distortionScale={-150}
            redOffset={5}
            greenOffset={15}
            blueOffset={25}
            brightness={60}
            opacity={0.8}
            mixBlendMode="screen"
            className="w-full max-w-lg"
          >
            <div className="p-8 h-full overflow-y-auto">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">Join GradNet</h1>
                <p className="text-white/70">Create your account and start connecting</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Account Type Selection */}
                <div className="space-y-3">
                  <p className="text-center text-white/70 text-sm">Choose your account type</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className={`h-14 flex flex-col gap-1 bg-transparent border-white/30 text-white hover:bg-white/20 ${
                        formData.accountType === 'student' ? 'bg-white/20 border-white/50' : ''
                      }`}
                      onClick={() => handleInputChange('accountType', 'student')}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span className="text-sm">Student</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className={`h-14 flex flex-col gap-1 bg-transparent border-white/30 text-white hover:bg-white/20 ${
                        formData.accountType === 'alumni' ? 'bg-white/20 border-white/50' : ''
                      }`}
                      onClick={() => handleInputChange('accountType', 'alumni')}
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">Alumni</span>
                    </Button>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="bg-transparent border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="bg-transparent border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                    required
                  />
                </div>

                {/* Email Field */}
                <Input
                  type="email"
                  placeholder={formData.accountType === 'student' ? 'your.name@cuchd.in' : 'your.email@gmail.com'}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-transparent border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                  required
                />

                {/* Password Fields */}
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="bg-transparent border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-white/60" />
                    ) : (
                      <Eye className="w-4 h-4 text-white/60" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="bg-transparent border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-white/60" />
                    ) : (
                      <Eye className="w-4 h-4 text-white/60" />
                    )}
                  </button>
                </div>

                {/* University and Graduation Year */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="University"
                    value={formData.university}
                    onChange={(e) => handleInputChange("university", e.target.value)}
                    className="bg-transparent border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Graduation Year"
                    value={formData.graduationYear}
                    onChange={(e) => handleInputChange("graduationYear", e.target.value)}
                    className="bg-transparent border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                    required
                  />
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                  />
                  <label htmlFor="terms" className="text-sm text-white/70">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>

                {error && (
                  <p className="text-sm text-red-400 text-center">{error}</p>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                  disabled={isLoading || !formData.agreeToTerms}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
              
              <div className="text-center mt-4">
                <p className="text-white/70 text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-white hover:text-white/80 font-medium">
                    Sign in here
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
