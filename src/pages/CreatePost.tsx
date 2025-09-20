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
import { ApprovalStatusAlert } from "@/components/ApprovalStatusAlert";
import { ArrowLeft, Save, Eye, X, Hash, Upload, Image as ImageIcon, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";
import useContentModeration from "@/hooks/useContentModeration";
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

const CreatePost = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createPost } = useBlog();
  const { user } = useAuth();
  const { moderateContent, isModeratingContent } = useContentModeration();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [communityName, setCommunityName] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Polish content feature state
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishHistory, setPolishHistory] = useState<string[]>([]);
  const [isPolishingTitle, setIsPolishingTitle] = useState(false);
  const [titleHistory, setTitleHistory] = useState<string[]>([]);
  const [isPolishingExcerpt, setIsPolishingExcerpt] = useState(false);
  const [excerptHistory, setExcerptHistory] = useState<string[]>([]);
  
  // AI tag generation state
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [aiGeneratedTags, setAiGeneratedTags] = useState<string[]>([]);
  const [lastTagGeneration, setLastTagGeneration] = useState<{title: string, content: string}>({title: '', content: ''});

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
      // Content moderation check
      const contentToModerate = `${formData.title}\n\n${formData.content}\n\n${formData.excerpt || ''}`;
      const moderationResult = await moderateContent(contentToModerate, 'post');
      
      if (!moderationResult.allowed) {
        setIsSubmitting(false);
        return; // Block the post creation
      }

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

  // Polish content using Ollama
  const polishContent = async () => {
    if (!formData.content.trim()) {
      alert('Please enter some content first.');
      return;
    }

    setIsPolishing(true);
    
    try {
      // Save current content to history for undo functionality
      setPolishHistory(prev => [...prev, formData.content]);

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2:3b',
          prompt: `Please improve the following blog post content by:
1. Fixing any spelling errors
2. Correcting grammar and punctuation
3. Improving sentence structure and flow
4. Making it more engaging and professional
5. Keeping the original meaning and tone
6. Maintaining any markdown formatting

Content to improve:
---
${formData.content}
---

Please provide only the improved content without any explanations or additional text:`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response) {
        // Update the content with the improved version
        setFormData(prev => ({ 
          ...prev, 
          content: data.response.trim()
        }));
      } else {
        throw new Error('No response from Ollama');
      }
    } catch (error) {
      console.error('Error polishing content:', error);
      alert('Failed to polish content. Please make sure Ollama is running with the llama3.2:3b model.');
    } finally {
      setIsPolishing(false);
    }
  };

  // Polish title using Ollama
  const polishTitle = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title first.');
      return;
    }

    setIsPolishingTitle(true);
    
    try {
      // Save current title to history for undo functionality
      setTitleHistory(prev => [...prev, formData.title]);

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2:3b',
          prompt: `Please improve the following blog post title by:
1. Fixing any spelling errors
2. Correcting grammar and punctuation
3. Making it more engaging and compelling
4. Keeping it concise and professional
5. Maintaining the original meaning

Title to improve: "${formData.title}"

Please provide only the improved title without quotes or additional text:`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response) {
        // Update the title with the improved version
        setFormData(prev => ({ 
          ...prev, 
          title: data.response.trim()
        }));
      } else {
        throw new Error('No response from Ollama');
      }
    } catch (error) {
      console.error('Error polishing title:', error);
      alert('Failed to polish title. Please make sure Ollama is running with the llama3.2:3b model.');
    } finally {
      setIsPolishingTitle(false);
    }
  };

  // Undo last polish operation
  const undoPolish = () => {
    if (polishHistory.length > 0) {
      const lastVersion = polishHistory[polishHistory.length - 1];
      setFormData(prev => ({ ...prev, content: lastVersion }));
      setPolishHistory(prev => prev.slice(0, -1));
    }
  };

  // Undo last title polish operation
  const undoTitlePolish = () => {
    if (titleHistory.length > 0) {
      const lastVersion = titleHistory[titleHistory.length - 1];
      setFormData(prev => ({ ...prev, title: lastVersion }));
      setTitleHistory(prev => prev.slice(0, -1));
    }
  };

  // Polish excerpt using Ollama
  const polishExcerpt = async () => {
    if (!formData.excerpt.trim()) {
      alert('Please enter an excerpt first.');
      return;
    }

    setIsPolishingExcerpt(true);
    
    try {
      // Save current excerpt to history for undo functionality
      setExcerptHistory(prev => [...prev, formData.excerpt]);

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2:3b',
          prompt: `Please improve the following blog post excerpt by:
1. Fixing any spelling errors
2. Correcting grammar and punctuation
3. Making it more engaging and compelling
4. Keeping it concise (under 200 characters)
5. Making it hook readers to want to read more

Excerpt to improve: "${formData.excerpt}"

Please provide only the improved excerpt without quotes or additional text:`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response) {
        // Update the excerpt with the improved version
        setFormData(prev => ({ 
          ...prev, 
          excerpt: data.response.trim()
        }));
      } else {
        throw new Error('No response from Ollama');
      }
    } catch (error) {
      console.error('Error polishing excerpt:', error);
      alert('Failed to polish excerpt. Please make sure Ollama is running with the llama3.2:3b model.');
    } finally {
      setIsPolishingExcerpt(false);
    }
  };

  // Undo last excerpt polish operation
  const undoExcerptPolish = () => {
    if (excerptHistory.length > 0) {
      const lastVersion = excerptHistory[excerptHistory.length - 1];
      setFormData(prev => ({ ...prev, excerpt: lastVersion }));
      setExcerptHistory(prev => prev.slice(0, -1));
    }
  };

  // Generate AI tags based on title and content
  const generateAITags = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return; // Don't generate if title or content is empty
    }

    // Check if content has changed since last generation
    if (lastTagGeneration.title === formData.title && lastTagGeneration.content === formData.content) {
      return; // Don't regenerate if nothing changed
    }

    setIsGeneratingTags(true);
    
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2:3b',
          prompt: `Based on the following blog post title and content, generate exactly 3 relevant tags that would help people discover this post. 

Title: "${formData.title}"

Content: "${formData.content.substring(0, 500)}..."

Requirements:
- Generate exactly 3 tags maximum
- Make tags concise (1-2 words each)
- Make them relevant to the content
- Use lowercase
- Separate tags with commas
- No hashtags or special characters
- Focus on the main topics, skills, or themes

Respond with only the 3 tags separated by commas, nothing else:`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response) {
        const tags = data.response.trim()
          .split(',')
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0)
          .slice(0, 3); // Ensure max 3 tags
        
        // Update AI generated tags
        setAiGeneratedTags(tags);
        
        // Add AI tags to formData if they don't already exist
        setFormData(prev => {
          const existingTags = prev.tags;
          const newTags = tags.filter(tag => !existingTags.includes(tag));
          return {
            ...prev,
            tags: [...existingTags, ...newTags]
          };
        });

        // Update last generation reference
        setLastTagGeneration({
          title: formData.title,
          content: formData.content
        });
      }
    } catch (error) {
      console.error('Error generating AI tags:', error);
      // Fail silently for tag generation
    } finally {
      setIsGeneratingTags(false);
    }
  };

  // Auto-generate tags when title and content are complete
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.title.trim() && formData.content.trim()) {
        generateAITags();
      }
    }, 2000); // Wait 2 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [formData.title, formData.content]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Approval Status Alert for Alumni */}
          {user?.accountType === 'alumni' && (
            <ApprovalStatusAlert 
              isApproved={user?.isApproved || false} 
              className="mb-6"
            />
          )}
          
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
              disabled={isSubmitting || isModeratingContent || !formData.title.trim() || !formData.content.trim()}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isModeratingContent ? 'Checking Content...' : isSubmitting ? 'Publishing...' : 'Publish Post'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Check if alumni is approved */}
            {user?.accountType === 'alumni' && !user?.isApproved ? (
              <div className="lg:col-span-4">
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="py-12 text-center">
                    <div className="text-red-600">
                      <h3 className="text-lg font-medium mb-2">Account Pending Approval</h3>
                      <p className="text-sm">
                        You cannot create posts until your alumni account is approved by the admin team.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
              
              {/* Title */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Post Title</CardTitle>
                    <div className="flex gap-2">
                      {titleHistory.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={undoTitlePolish}
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                        >
                          Undo
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={polishTitle}
                        disabled={isPolishingTitle || !formData.title.trim()}
                        className={`text-purple-600 border-purple-300 hover:bg-purple-50 transition-all duration-300 hover:scale-105 ${
                          isPolishingTitle ? 'animate-pulse bg-purple-50' : ''
                        }`}
                      >
                        <Sparkles className={`h-4 w-4 mr-2 ${isPolishingTitle ? 'animate-spin' : ''}`} />
                        {isPolishingTitle ? 'Polishing...' : 'Polish Title'}
                      </Button>
                    </div>
                  </div>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Content</CardTitle>
                      <CardDescription>
                        Write your post using Markdown. You can add code snippets, links, images, and more!
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {polishHistory.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={undoPolish}
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                        >
                          Undo Polish
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={polishContent}
                        disabled={isPolishing || !formData.content.trim()}
                        className={`text-purple-600 border-purple-300 hover:bg-purple-50 transition-all duration-300 hover:scale-105 ${
                          isPolishing ? 'animate-pulse bg-purple-50' : ''
                        }`}
                      >
                        <Sparkles className={`h-4 w-4 mr-2 ${isPolishing ? 'animate-spin' : ''}`} />
                        {isPolishing ? 'Polishing...' : 'Polish Content'}
                      </Button>
                    </div>
                  </div>
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
                  <div className="mt-4 space-y-4">
                    <div className="p-4 bg-surface-muted rounded-lg">
                      <h4 className="font-medium text-text-primary mb-2">Markdown Tips:</h4>
                      <div className="text-sm text-text-secondary space-y-1">
                        <p><code># Heading</code> - Create headings</p>
                        <p><code>**bold**</code> - Make text bold</p>
                        <p><code>`code`</code> - Inline code</p>
                        <p><code>```language</code> - Code blocks with syntax highlighting</p>
                        <p><code>[link text](url)</code> - Create links</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        <h4 className="font-medium text-purple-800">AI Content Polish</h4>
                      </div>
                      <p className="text-sm text-purple-700">
                        Use the "Polish Content" button to automatically improve spelling, grammar, 
                        punctuation, and readability of your content using AI.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Excerpt */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Custom Excerpt (Optional)</CardTitle>
                      <CardDescription>
                        If not provided, we'll automatically generate one from your content
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {excerptHistory.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={undoExcerptPolish}
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                        >
                          Undo
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={polishExcerpt}
                        disabled={isPolishingExcerpt || !formData.excerpt.trim()}
                        className={`text-purple-600 border-purple-300 hover:bg-purple-50 transition-all duration-300 hover:scale-105 ${
                          isPolishingExcerpt ? 'animate-pulse bg-purple-50' : ''
                        }`}
                      >
                        <Sparkles className={`h-4 w-4 mr-2 ${isPolishingExcerpt ? 'animate-spin' : ''}`} />
                        {isPolishingExcerpt ? 'Polishing...' : 'Polish'}
                      </Button>
                    </div>
                  </div>
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
                  <CardTitle className="flex items-center gap-2">
                    Tags
                    {isGeneratingTags && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                        <span className="text-sm text-purple-600">Generating AI tags...</span>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Add tags to help others discover your post. AI will automatically suggest tags based on your content.
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
                      {formData.tags.map((tag, index) => {
                        const isAIGenerated = aiGeneratedTags.includes(tag);
                        return (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className={`cursor-pointer transition-all ${
                              isAIGenerated 
                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600' 
                                : 'hover:bg-gray-300'
                            }`}
                            onClick={() => removeTag(tag)}
                          >
                            {isAIGenerated && <Sparkles className="h-3 w-3 mr-1" />}
                            {tag} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  
                  {aiGeneratedTags.length > 0 && (
                    <div className="text-xs text-purple-600 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI-generated tags are highlighted with a colorful background
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
            </>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default CreatePost;
