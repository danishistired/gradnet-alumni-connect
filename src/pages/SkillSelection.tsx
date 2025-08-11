import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";

const domainCategories = {
  "Engineering & Technology": [
    "Computer Science", "Software Engineering", "Data Science", "Machine Learning", 
    "Artificial Intelligence", "Cybersecurity", "Cloud Computing", "DevOps", 
    "Web Development", "Mobile Development", "Game Development", "Blockchain", 
    "IoT", "Robotics", "Backend Development", "Frontend Development", "Full Stack",
    "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", 
    "Chemical Engineering", "Aerospace Engineering", "Biomedical Engineering"
  ],
  "Business & Management": [
    "Business Administration", "Marketing", "Finance", "Accounting", "Economics", 
    "Human Resources", "Project Management", "Product Management", "Strategy", 
    "Operations Management", "Supply Chain", "Entrepreneurship", "Consulting", 
    "Sales", "Digital Marketing", "Brand Management", "Business Analytics"
  ],
  "Design & Creative": [
    "UI/UX Design", "Graphic Design", "Product Design", "Industrial Design", 
    "Architecture", "Interior Design", "Fashion Design", "Photography", 
    "Video Production", "Animation", "Digital Art", "Web Design", 
    "Brand Design", "Illustration", "Creative Writing", "Content Creation"
  ],
  "Healthcare & Life Sciences": [
    "Medicine", "Nursing", "Pharmacy", "Dentistry", "Veterinary", "Public Health", 
    "Biotechnology", "Bioinformatics", "Medical Research", "Clinical Research", 
    "Healthcare Administration", "Physical Therapy", "Psychology", "Nutrition", 
    "Medical Technology", "Health Informatics"
  ],
  "Education & Research": [
    "Teaching", "Educational Technology", "Curriculum Development", "Academic Research", 
    "Educational Administration", "Library Science", "Training & Development", 
    "E-learning", "Educational Psychology", "Special Education", "STEM Education", 
    "Language Education", "Educational Policy"
  ],
  "Media & Communication": [
    "Journalism", "Public Relations", "Social Media", "Content Strategy", 
    "Broadcasting", "Digital Media", "Communications", "Marketing Communications", 
    "Technical Writing", "Copywriting", "Media Production", "Event Management", 
    "Corporate Communications"
  ],
  "Legal & Government": [
    "Law", "Corporate Law", "Criminal Justice", "Public Policy", "Government", 
    "Legal Research", "Compliance", "Regulatory Affairs", "International Relations", 
    "Political Science", "Public Administration", "Legal Technology"
  ],
  "Other Fields": [
    "Agriculture", "Environmental Science", "Social Work", "Non-profit", 
    "Sports Management", "Hospitality", "Tourism", "Real Estate", "Insurance", 
    "Logistics", "Quality Assurance", "Data Analysis", "Research & Development"
  ]
};

export default function SkillSelection() {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Engineering & Technology"]);
  const navigate = useNavigate();

  const toggleDomain = (domain: string) => {
    setSelectedDomains(prev => {
      if (prev.includes(domain)) {
        return prev.filter(d => d !== domain);
      } else if (prev.length < 5) {
        return [...prev, domain];
      }
      return prev;
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleContinue = () => {
    if (selectedDomains.length >= 3) {
      navigate('/feed');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <Card className="w-full max-w-6xl card-elevated">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold text-text-primary mb-2">
            Choose Your Domains
          </CardTitle>
          <p className="text-text-secondary text-lg">
            Select 3-5 domains you're interested in to personalize your experience
          </p>
          <div className="flex justify-center mt-4">
            <Badge variant="outline" className="px-4 py-2">
              {selectedDomains.length}/5 selected (minimum 3 required)
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {Object.entries(domainCategories).map(([category, domains]) => (
            <div key={category} className="border rounded-lg p-4">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-2 hover:bg-surface-muted rounded"
              >
                <h3 className="text-lg font-semibold text-text-primary">{category}</h3>
                <div className="text-text-secondary">
                  {expandedCategories.includes(category) ? '−' : '+'}
                </div>
              </button>
              
              {expandedCategories.includes(category) && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                  {domains.map((domain) => {
                    const isSelected = selectedDomains.includes(domain);
                    const isDisabled = !isSelected && selectedDomains.length >= 5;
                    
                    return (
                      <button
                        key={domain}
                        onClick={() => toggleDomain(domain)}
                        disabled={isDisabled}
                        className={`
                          p-3 rounded-lg border-2 transition-all duration-200 text-left text-sm
                          ${isSelected 
                            ? 'border-accent bg-accent-light text-accent' 
                            : isDisabled 
                              ? 'border-border bg-surface-muted text-text-muted cursor-not-allowed'
                              : 'border-border bg-surface hover:border-accent hover:bg-accent-light/50'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{domain}</span>
                          {isSelected ? (
                            <CheckCircle className="w-4 h-4 text-accent" />
                          ) : (
                            <Circle className="w-4 h-4 text-text-muted" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-center pt-8">
            <Button 
              onClick={handleContinue}
              disabled={selectedDomains.length < 3}
              size="lg"
              className="px-8"
            >
              Complete Setup
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}