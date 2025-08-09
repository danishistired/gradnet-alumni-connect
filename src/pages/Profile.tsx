import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/Navbar";
import { 
  User, 
  Mail, 
  Building, 
  Calendar, 
  MapPin, 
  Briefcase,
  Globe,
  Github,
  Linkedin,
  Camera,
  Save,
  Edit,
  X
} from "lucide-react";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: 'student' | 'alumni';
  university: string;
  graduationYear: string;
  profilePicture?: string;
  bio: string;
  skills: string[];
  company: string;
  jobTitle: string;
  linkedIn: string;
  github: string;
  website: string;
  location: string;
}

const Profile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    skills: [] as string[],
    company: "",
    jobTitle: "",
    linkedIn: "",
    github: "",
    website: "",
    location: "",
    university: "",
    graduationYear: ""
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfile(data.user);
          setFormData({
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            bio: data.user.bio || "",
            skills: data.user.skills || [],
            company: data.user.company || "",
            jobTitle: data.user.jobTitle || "",
            linkedIn: data.user.linkedIn || "",
            github: data.user.github || "",
            website: data.user.website || "",
            location: data.user.location || "",
            university: data.user.university || "",
            graduationYear: data.user.graduationYear || ""
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfile(data.user);
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio || "",
        skills: profile.skills || [],
        company: profile.company || "",
        jobTitle: profile.jobTitle || "",
        linkedIn: profile.linkedIn || "",
        github: profile.github || "",
        website: profile.website || "",
        location: profile.location || "",
        university: profile.university || "",
        graduationYear: profile.graduationYear || ""
      });
    }
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      
      try {
        const response = await fetch('http://localhost:5000/api/profile/picture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profilePicture: base64 })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && profile) {
            setProfile({ ...profile, profilePicture: data.profilePicture });
          }
        }
      } catch (error) {
        console.error('Failed to upload profile picture:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 px-4 text-center">
          <h1 className="text-2xl font-bold text-text-primary">Profile not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Profile Picture & Basic Info */}
            <div className="lg:col-span-1">
              <Card className="card-elevated">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="h-32 w-32">
                        <AvatarImage src={profile.profilePicture || undefined} />
                        <AvatarFallback className="bg-accent text-accent-foreground text-2xl">
                          {getInitials(profile.firstName, profile.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <label htmlFor="profile-picture" className="absolute bottom-0 right-0 bg-accent hover:bg-accent-hover text-accent-foreground p-2 rounded-full cursor-pointer transition-colors">
                        <Camera className="h-4 w-4" />
                        <input
                          id="profile-picture"
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-text-primary">
                        {profile.firstName} {profile.lastName}
                      </h1>
                      <p className="text-text-secondary">
                        {profile.accountType === 'student' ? 'Student' : 'Alumni'}
                      </p>
                      {profile.jobTitle && profile.company && (
                        <p className="text-sm text-text-secondary mt-1">
                          {profile.jobTitle} at {profile.company}
                        </p>
                      )}
                    </div>

                    <div className="w-full space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-text-secondary" />
                        <span className="text-text-secondary">{profile.email}</span>
                      </div>
                      {profile.university && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-text-secondary" />
                          <span className="text-text-secondary">{profile.university}</span>
                        </div>
                      )}
                      {profile.graduationYear && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-text-secondary" />
                          <span className="text-text-secondary">Class of {profile.graduationYear}</span>
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-text-secondary" />
                          <span className="text-text-secondary">{profile.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Social Links */}
                    {(profile.linkedIn || profile.github || profile.website) && (
                      <div className="flex gap-2">
                        {profile.linkedIn && (
                          <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="p-2 bg-surface-muted hover:bg-accent-light rounded-full transition-colors">
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {profile.github && (
                          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-surface-muted hover:bg-accent-light rounded-full transition-colors">
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                        {profile.website && (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-surface-muted hover:bg-accent-light rounded-full transition-colors">
                            <Globe className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Information */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Edit Button */}
              <div className="flex justify-end">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleCancel} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Bio Section */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      placeholder="Tell us about yourself..."
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                    />
                  ) : (
                    <p className="text-text-secondary">
                      {profile.bio || "No bio available yet."}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Skills Section */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <Button onClick={addSkill}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                            {skill} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))
                      ) : (
                        <p className="text-text-secondary">No skills added yet.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="university">University</Label>
                        <Input
                          id="university"
                          value={formData.university}
                          onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="graduationYear">Graduation Year</Label>
                        <Input
                          id="graduationYear"
                          value={formData.graduationYear}
                          onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="City, Country"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                      {profile.accountType === 'alumni' && (
                        <>
                          <div>
                            <Label htmlFor="company">Company</Label>
                            <Input
                              id="company"
                              value={formData.company}
                              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                              id="jobTitle"
                              value={formData.jobTitle}
                              onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-text-primary">University</p>
                        <p className="text-text-secondary">{profile.university || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">Graduation Year</p>
                        <p className="text-text-secondary">{profile.graduationYear || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">Location</p>
                        <p className="text-text-secondary">{profile.location || 'Not specified'}</p>
                      </div>
                      {profile.accountType === 'alumni' && (
                        <>
                          <div>
                            <p className="font-medium text-text-primary">Company</p>
                            <p className="text-text-secondary">{profile.company || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">Job Title</p>
                            <p className="text-text-secondary">{profile.jobTitle || 'Not specified'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                        <Input
                          id="linkedIn"
                          placeholder="https://linkedin.com/in/yourprofile"
                          value={formData.linkedIn}
                          onChange={(e) => setFormData(prev => ({ ...prev, linkedIn: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="github">GitHub Profile</Label>
                        <Input
                          id="github"
                          placeholder="https://github.com/yourusername"
                          value={formData.github}
                          onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Personal Website</Label>
                        <Input
                          id="website"
                          placeholder="https://yourwebsite.com"
                          value={formData.website}
                          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {profile.linkedIn && (
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-text-secondary" />
                          <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover">
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                      {profile.github && (
                        <div className="flex items-center gap-2">
                          <Github className="h-4 w-4 text-text-secondary" />
                          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover">
                            GitHub Profile
                          </a>
                        </div>
                      )}
                      {profile.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-text-secondary" />
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover">
                            Personal Website
                          </a>
                        </div>
                      )}
                      {!profile.linkedIn && !profile.github && !profile.website && (
                        <p className="text-text-secondary">No social links added yet.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
