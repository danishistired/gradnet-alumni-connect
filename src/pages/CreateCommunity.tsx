import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCommunity } from "@/contexts/CommunityContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, Save, Users, Globe, Lock, Eye, AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CreateCommunity = () => {
  const navigate = useNavigate();
  const { createCommunity } = useCommunity();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [checkingName, setCheckingName] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    category: "general",
    communityType: "public" as "public" | "restricted" | "private",
    nsfw: false,
    allowImages: true,
    allowPolls: true,
    rules: [] as string[],
    moderationLevel: "moderate" as "low" | "moderate" | "high"
  });

  const [newRule, setNewRule] = useState("");

  const categories = [
    { value: "general", label: "General Discussion", icon: "💬" },
    { value: "tech", label: "Technology", icon: "💻" },
    { value: "career", label: "Career & Jobs", icon: "💼" },
    { value: "student-life", label: "Student Life", icon: "🎓" },
    { value: "networking", label: "Networking", icon: "🤝" },
    { value: "skills", label: "Skills & Learning", icon: "📚" },
    { value: "industry", label: "Industry Insights", icon: "🏢" },
    { value: "projects", label: "Projects & Showcase", icon: "🚀" },
    { value: "gaming", label: "Gaming", icon: "🎮" },
    { value: "hobbies", label: "Hobbies & Interests", icon: "🎨" }
  ];

  const communityTypes = [
    {
      value: "public",
      label: "Public",
      description: "Anyone can view, post, and comment in this community",
      icon: Globe
    },
    {
      value: "restricted",
      label: "Restricted",
      description: "Anyone can view, but only approved users can post",
      icon: Eye
    },
    {
      value: "private",
      label: "Private",
      description: "Only approved users can view and participate",
      icon: Lock
    }
  ];

  const handleNameChange = async (value: string) => {
    // Remove g- prefix if user types it, and validate
    const cleanName = value.replace(/^g-/, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    
    setFormData(prev => ({ 
      ...prev, 
      name: cleanName,
      displayName: cleanName ? `g-${cleanName}` : ""
    }));

    if (cleanName.length >= 3) {
      setCheckingName(true);
      setNameAvailable(null);
      
      try {
        const response = await fetch(`http://localhost:5000/api/communities/check-name/g-${cleanName}`);
        const data = await response.json();
        
        if (data.success) {
          setNameAvailable(data.available);
        } else {
          setNameAvailable(false);
        }
      } catch (error) {
        console.error('Error checking name availability:', error);
        setNameAvailable(null);
      } finally {
        setCheckingName(false);
      }
    } else {
      setNameAvailable(null);
    }
  };

  const addRule = () => {
    if (newRule.trim() && formData.rules.length < 10) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()]
      }));
      setNewRule("");
    }
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      alert("Community name and description are required!");
      return;
    }

    if (nameAvailable === false) {
      alert("Please choose an available community name!");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createCommunity({
        name: `g-${formData.name}`,
        displayName: formData.displayName,
        description: formData.description,
        icon: categories.find(c => c.value === formData.category)?.icon || "💬",
        // Additional community settings would be sent to backend
      });

      if (result) {
        navigate(`/g/g-${formData.name}`);
      } else {
        alert("Failed to create community. Please try again.");
      }
    } catch (error) {
      alert("Failed to create community. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/feed")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Feed
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Create a Community</h1>
                <p className="text-text-secondary">Build a new space for your interests</p>
              </div>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.name.trim() || !formData.description.trim() || nameAvailable === false}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create Community'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Community Name */}
              <Card>
                <CardHeader>
                  <CardTitle>Community Name</CardTitle>
                  <CardDescription>
                    Choose a unique name for your community. It will be prefixed with "g-"
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Community Name</Label>
                    <div className="flex items-center">
                      <span className="bg-surface-muted text-text-secondary px-3 py-2 border border-r-0 rounded-l-md text-sm">
                        g-
                      </span>
                      <Input
                        id="name"
                        placeholder="awesomecommunity"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="rounded-l-none flex-1"
                        maxLength={21}
                      />
                    </div>
                    
                    {/* Name validation feedback */}
                    {formData.name.length >= 3 && (
                      <div className="mt-2">
                        {checkingName ? (
                          <p className="text-sm text-text-secondary">Checking availability...</p>
                        ) : nameAvailable === true ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <Check className="h-4 w-4" />
                            <span className="text-sm">g-{formData.name} is available!</span>
                          </div>
                        ) : nameAvailable === false ? (
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">g-{formData.name} is already taken</span>
                          </div>
                        ) : null}
                      </div>
                    )}
                    
                    <p className="text-xs text-text-secondary mt-1">
                      3-21 characters. Letters and numbers only.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Community Description</CardTitle>
                  <CardDescription>
                    Describe what your community is about
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Tell people what this community is for, what kind of posts you expect, and what makes it special..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    {formData.description.length}/500 characters
                  </p>
                </CardContent>
              </Card>

              {/* Community Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Community Type</CardTitle>
                  <CardDescription>
                    Choose who can view and participate in your community
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {communityTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.communityType === type.value
                            ? 'border-accent bg-accent/5'
                            : 'border-border hover:border-accent/50'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, communityType: type.value as any }))}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-accent mt-0.5" />
                          <div>
                            <h4 className="font-medium text-text-primary">{type.label}</h4>
                            <p className="text-sm text-text-secondary">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Community Rules */}
              <Card>
                <CardHeader>
                  <CardTitle>Community Rules (Optional)</CardTitle>
                  <CardDescription>
                    Set guidelines for your community members
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a community rule"
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addRule()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={addRule}
                      variant="outline"
                      size="sm"
                      disabled={!newRule.trim() || formData.rules.length >= 10}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {formData.rules.length > 0 && (
                    <div className="space-y-2">
                      {formData.rules.map((rule, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-surface-muted rounded-lg">
                          <span className="text-sm">{index + 1}. {rule}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRule(index)}
                            className="text-text-secondary hover:text-red-500"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-text-secondary">
                    {formData.rules.length}/10 rules
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Additional Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Content Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-images">Allow Images</Label>
                      <p className="text-xs text-text-secondary">Members can post images</p>
                    </div>
                    <Switch
                      id="allow-images"
                      checked={formData.allowImages}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowImages: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="nsfw">18+ Content</Label>
                      <p className="text-xs text-text-secondary">Community may contain mature content</p>
                    </div>
                    <Switch
                      id="nsfw"
                      checked={formData.nsfw}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, nsfw: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="h-10 w-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-lg">
                      {categories.find(c => c.value === formData.category)?.icon || "💬"}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-text-primary">
                        {formData.displayName || "g-communityname"}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <Users className="h-3 w-3" />
                        <span>1 member</span>
                      </div>
                    </div>
                  </div>
                  
                  {formData.description && (
                    <p className="text-sm text-text-secondary mt-3 line-clamp-3">
                      {formData.description}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Creator Info */}
              {user && (
                <Card>
                  <CardHeader>
                    <CardTitle>Community Creator</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profilePicture || undefined} />
                        <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-text-primary">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {user.accountType === 'student' ? 'Student' : 'Alumni'} • {user.university}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Important Notice */}
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Community names cannot be changed after creation. 
              Make sure you're happy with "g-{formData.name || 'communityname'}" before proceeding.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunity;
