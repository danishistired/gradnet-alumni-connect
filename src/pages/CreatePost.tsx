import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useBlog } from "@/contexts/BlogContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, Save, Eye, X, Hash, Upload, Image as ImageIcon } from "lucide-react";
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

const CreatePost = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createPost } = useBlog();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [communityName, setCommunityName] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const communityParam = searchParams.get('community');
    if (communityParam) {
      setCommunityId(communityParam);
      fetchCommunityInfo(communityParam);
    }
  }, [searchParams]);

  const fetchCommunityInfo = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/communities`);
      const data = await response.json();
      if (data.success) {
        const community = data.communities.find((c: any) => c.id === id);
        if (community) {
          setCommunityName(community.name);
        }
      }
    } catch (error) {
      console.error('Failed to fetch community info:', error);
    }
  };

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    tags: [] as string[],
    category: "general",
    targetAudience: "both" as "students" | "alumni" | "both",
    communityId: null as string | null,
    image: null as string | null
  });

  const categories = [
    { value: "general", label: "General" },
    { value: "career-advice", label: "Career Advice" },
    { value: "tech-insights", label: "Tech Insights" },
    { value: "company-culture", label: "Company Culture" },
    { value: "networking", label: "Networking" },
    { value: "skill-development", label: "Skill Development" },
    { value: "industry-trends", label: "Industry Trends" },
    { value: "student-life", label: "Student Life" },
    { value: "internships", label: "Internships" },
    { value: "job-search", label: "Job Search" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Title and content are required!");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageBase64 = null;
      
      // Convert image to base64 if selected
      if (selectedImage) {
        imageBase64 = await convertImageToBase64(selectedImage);
      }

      const postData = {
        ...formData,
        excerpt: formData.excerpt || generateExcerpt(formData.content),
        communityId: communityId,
        image: imageBase64
      };
      
      const result = await createPost(postData);

      if (result.success) {
        if (communityId && communityName) {
          navigate(`/g/${communityName}`);
        } else {
          navigate("/feed");
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateExcerpt = (content: string) => {
    // Remove markdown syntax and get first 150 characters
    const plainText = content
      .replace(/[#*`]/g, '') // Remove basic markdown
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
    
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
                onClick={() => {
                  if (communityId && communityName) {
                    navigate(`/g/${communityName}`);
                  } else {
                    navigate("/feed");
                  }
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {communityName ? `Back to g/${communityName}` : "Back to Feed"}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Create New Post</h1>
                <p className="text-text-secondary">
                  {communityName 
                    ? `Share your thoughts with g/${communityName}`
                    : "Share your thoughts with the GradNet community"
                  }
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Publishing...' : 'Publish Post'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Title */}
              <Card>
                <CardHeader>
                  <CardTitle>Post Title</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Enter an engaging title for your post..."
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="text-lg"
                  />
                </CardContent>
              </Card>

              {/* Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Post Image (Optional)</CardTitle>
                  <CardDescription>
                    Add an image to make your post more engaging. Max size: 5MB
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!imagePreview ? (
                    <div className="space-y-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed border-border hover:border-accent transition-colors flex flex-col items-center justify-center gap-2"
                      >
                        <Upload className="h-8 w-8 text-text-secondary" />
                        <span className="text-text-secondary">Click to upload an image</span>
                        <span className="text-sm text-text-muted">Supports JPG, PNG, GIF up to 5MB</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full max-h-64 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeImage}
                          className="absolute top-2 right-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Change Image
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Content Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                  <CardDescription>
                    Write your post using Markdown. You can add code snippets, links, images, and more!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <MDEditor
                      value={formData.content}
                      onChange={(val) => setFormData(prev => ({ ...prev, content: val || "" }))}
                      preview="edit"
                      hideToolbar={false}
                      height={400}
                      data-color-mode="light"
                    />
                  </div>
                  
                  {/* Quick Tips */}
                  <div className="mt-4 p-4 bg-surface-muted rounded-lg">
                    <h4 className="font-medium text-text-primary mb-2">Markdown Tips:</h4>
                    <div className="text-sm text-text-secondary space-y-1">
                      <p><code># Heading</code> - Create headings</p>
                      <p><code>**bold**</code> - Make text bold</p>
                      <p><code>`code`</code> - Inline code</p>
                      <p><code>```language</code> - Code blocks with syntax highlighting</p>
                      <p><code>[link text](url)</code> - Create links</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Excerpt */}
              <Card>
                <CardHeader>
                  <CardTitle>Custom Excerpt (Optional)</CardTitle>
                  <CardDescription>
                    If not provided, we'll automatically generate one from your content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Write a compelling excerpt to hook your readers..."
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    maxLength={200}
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    {formData.excerpt.length}/200 characters
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Post Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Post Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Category */}
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <Label htmlFor="audience">Target Audience</Label>
                    <Select value={formData.targetAudience} onValueChange={(value: "students" | "alumni" | "both") => setFormData(prev => ({ ...prev, targetAudience: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Everyone</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                        <SelectItem value="alumni">Alumni Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                  <CardDescription>
                    Add tags to help others discover your post
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button 
                      onClick={addTag}
                      variant="outline"
                      size="sm"
                      disabled={!newTag.trim()}
                    >
                      <Hash className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Author Info */}
              {user && (
                <Card>
                  <CardHeader>
                    <CardTitle>Publishing As</CardTitle>
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
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
