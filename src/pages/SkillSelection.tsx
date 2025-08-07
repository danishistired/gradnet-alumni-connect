import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";

const domains = [
  "React", "Node.js", "Python", "Machine Learning", "Data Science", 
  "Flutter", "iOS Development", "Android Development", "DevOps", "Cloud Computing",
  "Cybersecurity", "Blockchain", "UI/UX Design", "Product Management", "Backend Development",
  "Frontend Development", "Full Stack", "Artificial Intelligence", "Game Development", "Mobile Development",
  "Web Development", "Database Management", "System Design", "Microservices", "API Development"
];

export default function SkillSelection() {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggleDomain = (domain: string) => {
    setSelectedDomains(prev => {
      if (prev.includes(domain)) {
        return prev.filter(d => d !== domain);
      } else if (prev.length < 3) {
        return [...prev, domain];
      }
      return prev;
    });
  };

  const handleContinue = () => {
    if (selectedDomains.length === 3) {
      navigate('/company-selection');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl card-elevated">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold text-text-primary mb-2">
            Choose Your Domains
          </CardTitle>
          <p className="text-text-secondary text-lg">
            Select exactly 3 domains you're interested in to personalize your feed
          </p>
          <div className="flex justify-center mt-4">
            <Badge variant="outline" className="px-4 py-2">
              {selectedDomains.length}/3 selected
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {domains.map((domain) => {
              const isSelected = selectedDomains.includes(domain);
              const isDisabled = !isSelected && selectedDomains.length >= 3;
              
              return (
                <button
                  key={domain}
                  onClick={() => toggleDomain(domain)}
                  disabled={isDisabled}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200 text-left
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
                      <CheckCircle className="w-5 h-5 text-accent" />
                    ) : (
                      <Circle className="w-5 h-5 text-text-muted" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-center pt-8">
            <Button 
              onClick={handleContinue}
              disabled={selectedDomains.length !== 3}
              size="lg"
              className="px-8"
            >
              Continue to Companies
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}