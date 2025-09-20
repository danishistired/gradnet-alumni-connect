import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, DollarSign, Users, Calendar, Target } from 'lucide-react';

interface FundraiserFormProps {
  onClose: () => void;
}

export const FundraiserForm = ({ onClose }: FundraiserFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    targetAmount: '',
    fundingGoal: '',
    businessModel: '',
    marketSize: '',
    competition: '',
    teamSize: '',
    timeline: '',
    riskAssessment: '',
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');

  const categories = [
    'CleanTech', 'HealthTech', 'EdTech', 'FinTech', 'AgriTech', 
    'FoodTech', 'RetailTech', 'PropTech', 'DeepTech', 'Social Impact'
  ];

  const predefinedTags = [
    'AI/ML', 'Blockchain', 'IoT', 'Mobile App', 'Web Platform',
    'Hardware', 'Software', 'B2B', 'B2C', 'B2G', 'SaaS',
    'Marketplace', 'Social Impact', 'Sustainability', 'Innovation'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.category || !formData.targetAmount) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Simulate submission
    toast({
      title: "Fundraiser Created Successfully!",
      description: "Your fundraiser has been submitted for review. Alumni will be able to view and invest once approved.",
    });

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Provide the fundamental details about your startup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Startup Name / Project Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., EcoTech Solutions - Sustainable Energy Storage"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide a compelling description of your startup idea, the problem it solves, and your solution..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetAmount">Target Funding Amount (₹) *</Label>
              <Input
                id="targetAmount"
                type="number"
                value={formData.targetAmount}
                onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                placeholder="e.g., 250000"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Business Details
          </CardTitle>
          <CardDescription>
            Explain your business model and market opportunity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fundingGoal">What will you use the funding for? *</Label>
            <Textarea
              id="fundingGoal"
              value={formData.fundingGoal}
              onChange={(e) => handleInputChange('fundingGoal', e.target.value)}
              placeholder="e.g., Develop prototype, conduct pilot testing, hire additional team members..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="businessModel">Business Model *</Label>
            <Textarea
              id="businessModel"
              value={formData.businessModel}
              onChange={(e) => handleInputChange('businessModel', e.target.value)}
              placeholder="e.g., B2B SaaS with hardware component, subscription-based maintenance..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="marketSize">Market Size & Opportunity</Label>
            <Input
              id="marketSize"
              value={formData.marketSize}
              onChange={(e) => handleInputChange('marketSize', e.target.value)}
              placeholder="e.g., $45B global energy storage market"
            />
          </div>

          <div>
            <Label htmlFor="competition">Competition Analysis</Label>
            <Textarea
              id="competition"
              value={formData.competition}
              onChange={(e) => handleInputChange('competition', e.target.value)}
              placeholder="Who are your main competitors? What makes you different?"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Team & Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team & Timeline
          </CardTitle>
          <CardDescription>
            Tell us about your team and project timeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="teamSize">Team Size</Label>
              <Input
                id="teamSize"
                type="number"
                value={formData.teamSize}
                onChange={(e) => handleInputChange('teamSize', e.target.value)}
                placeholder="e.g., 4"
              />
            </div>

            <div>
              <Label htmlFor="timeline">Timeline to Market</Label>
              <Input
                id="timeline"
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                placeholder="e.g., 18 months to market"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="riskAssessment">Risk Assessment</Label>
            <Textarea
              id="riskAssessment"
              value={formData.riskAssessment}
              onChange={(e) => handleInputChange('riskAssessment', e.target.value)}
              placeholder="What are the main risks and how will you mitigate them?"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags & Keywords</CardTitle>
          <CardDescription>
            Add relevant tags to help investors find your project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Quick Add Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {predefinedTags.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTag(tag)}
                  disabled={formData.tags.includes(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <Label htmlFor="customTag">Add Custom Tag</Label>
            <div className="flex gap-2">
              <Input
                id="customTag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter custom tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(newTag);
                  }
                }}
              />
              <Button type="button" onClick={() => addTag(newTag)}>
                Add
              </Button>
            </div>
          </div>

          {formData.tags.length > 0 && (
            <div>
              <Label>Selected Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Uploads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Supporting Documents (Optional)
          </CardTitle>
          <CardDescription>
            Upload additional documents to strengthen your pitch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Pitch Deck</p>
              <p className="text-xs text-muted-foreground">PDF, PPT (Max 10MB)</p>
            </div>
            
            <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Business Plan</p>
              <p className="text-xs text-muted-foreground">PDF, DOC (Max 5MB)</p>
            </div>
            
            <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Financial Projections</p>
              <p className="text-xs text-muted-foreground">PDF, XLS (Max 5MB)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Submit Fundraiser
        </Button>
      </div>
    </form>
  );
};