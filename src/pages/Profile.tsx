import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Sidebar } from "@/components/Sidebar";
import { FollowButton } from "@/components/FollowButton";
import { FollowCountsDisplay } from "@/components/FollowCountsDisplay";
import { ImageCropModal } from "@/components/ImageCropModal";
import { MessagesDialog } from "@/components/MessagesDialog";
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
  X,
  Image as ImageIcon,
  Plus,
  MessageSquare
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { ReferralBar } from "@/components/ReferralBar";
import { SubscriptionBar } from "@/components/SubscriptionBar";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: 'student' | 'alumni';
  university: string;
  graduationYear: string;
  profilePicture?: string;
  bannerImage?: string;
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
  const navigate = useNavigate();
  const { userId: profileUserId } = useParams();
  const { user, token } = useAuth();
  const isOwnProfile = !profileUserId || profileUserId === user?.id;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  
  // Image crop modal states
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [cropType, setCropType] = useState<'profile' | 'banner'>('profile');
  
  // Chat dialog state
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  
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
    if (profileUserId || isOwnProfile) {
      fetchProfile();
    }
  }, [user, navigate, profileUserId, isOwnProfile]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const endpoint = isOwnProfile 
        ? 'http://localhost:5000/api/profile'
        : `http://localhost:5000/api/user/${profileUserId}/profile`;
        
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfile(data.user);
          if (isOwnProfile) {
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCropImageSrc(result);
      setCropType(type);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    try {
      const endpoint = cropType === 'profile' 
        ? 'http://localhost:5000/api/profile/picture'
        : 'http://localhost:5000/api/profile/banner';
      
      const body = cropType === 'profile' 
        ? { profilePicture: croppedImageUrl }
        : { bannerImage: croppedImageUrl };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && profile) {
          if (cropType === 'profile') {
            setProfile({ ...profile, profilePicture: data.profilePicture });
          } else {
            setProfile({ ...profile, bannerImage: data.bannerImage });
          }
        }
      }
    } catch (error) {
      console.error(`Failed to upload ${cropType} image:`, error);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="relative w-full min-h-screen">
          <Sidebar />
          <div className="w-full overflow-auto flex justify-center">
            <div className="w-full max-w-4xl p-6 pt-20 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="relative w-full min-h-screen">
          <Sidebar />
          <div className="w-full overflow-auto flex justify-center">
            <div className="w-full max-w-4xl p-6 pt-20 text-center">
              <h1 className="text-2xl font-bold text-text-primary">Profile not found</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="relative w-full min-h-screen">
        <Sidebar />
        <div className="w-full overflow-auto flex justify-center">
          <div className="w-full max-w-4xl p-6 pt-20">
          {/* Banner and Profile Picture Section */}
          <Card className="mb-6 overflow-hidden">
            {/* Banner */}
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
              {profile.bannerImage && (
                <img 
                  src={profile.bannerImage} 
                  alt="Banner" 
                  className="w-full h-full object-cover"
                />
              )}
              {isOwnProfile && (
                <label className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full cursor-pointer transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'banner')}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            {/* Profile Info */}
            <CardContent className="relative pt-0 pb-6">
              {/* Profile Picture */}
              <div className="relative -mt-16 mb-4 flex justify-start ml-6">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                    <AvatarImage src={profile.profilePicture || undefined} />
                    <AvatarFallback className="bg-accent text-accent-foreground text-2xl">
                      {getInitials(profile.firstName, profile.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  {isOwnProfile && (
                    <label className="absolute bottom-0 right-0 bg-accent hover:bg-accent-hover text-accent-foreground p-2 rounded-full cursor-pointer transition-colors">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'profile')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
              
              {/* Basic Info */}
              <div className="px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-1">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    <p className="text-lg text-text-secondary mb-2">
                      {profile.jobTitle || (profile.accountType === 'student' ? 'Student' : 'Alumni')}
                      {profile.company && ` at ${profile.company}`}
                    </p>
                    {profile.location && (
                      <p className="text-sm text-text-secondary flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-3 mt-4 sm:mt-0">
                    {/* Follow Counts */}
                    <FollowCountsDisplay userId={profile.id} />
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {isOwnProfile ? (
                        <Button 
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <>
                          <FollowButton 
                            userId={profile.id} 
                            variant="default" 
                            size="sm"
                            showIcon={true}
                          />
                          <Button 
                            onClick={() => setShowMessagesDialog(true)}
                            variant="outline"
                            size="sm"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Bio */}
                {profile.bio && (
                  <div className="mb-4">
                    <p className="text-text-primary">{profile.bio}</p>
                  </div>
                )}
                
                {/* University Info */}
                <div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-4">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {profile.university}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Class of {profile.graduationYear}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {profile.accountType === 'student' ? 'Student' : 'Alumni'}
                  </div>
                </div>
                
                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-text-primary mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Social Links */}
                <div className="flex gap-3">
                  {profile.linkedIn && (
                    <a 
                      href={profile.linkedIn.startsWith('http') ? profile.linkedIn : `https://${profile.linkedIn}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-text-secondary hover:text-accent transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {profile.github && (
                    <a 
                      href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-text-secondary hover:text-accent transition-colors"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {profile.website && (
                    <a 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-text-secondary hover:text-accent transition-colors"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Section */}
          {isOwnProfile && isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                      placeholder="Your job title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Your company"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Your location"
                  />
                </div>

                {/* Skills Section */}
                <div>
                  <Label>Skills</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button type="button" onClick={addSkill} variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                          {skill} <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="linkedIn">LinkedIn</Label>
                    <Input
                      id="linkedIn"
                      value={formData.linkedIn}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedIn: e.target.value }))}
                      placeholder="LinkedIn profile URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      value={formData.github}
                      onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                      placeholder="GitHub profile URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="Personal website URL"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end pt-4">
                  <Button onClick={handleCancel} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Image Crop Modal */}
        <ImageCropModal
          isOpen={showCropModal}
          onClose={() => setShowCropModal(false)}
          onCropComplete={handleCropComplete}
          src={cropImageSrc}
          aspectRatio={cropType === 'profile' ? 1 : 16/9}
          cropShape={cropType === 'profile' ? 'round' : 'rect'}
          title={cropType === 'profile' ? 'Crop Profile Picture' : 'Crop Banner Image'}
        />

        {/* Messages Dialog */}
        <MessagesDialog
          open={showMessagesDialog}
          onOpenChange={setShowMessagesDialog}
        />
          </div>
        </div>
        
        {/* Referral and Subscription Bars - only show on own profile */}
        {isOwnProfile && (
          <div className="max-w-4xl mx-auto px-4 space-y-4 mb-8">
            {/* Referral Bar - for all users */}
            <ReferralBar />
            
            {/* Subscription Bar - only for students */}
            <SubscriptionBar />
          </div>
        )}
        
        {/* Footer */}
        <Footer />
      </div>
  );
};

export default Profile;
