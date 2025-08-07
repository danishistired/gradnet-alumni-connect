import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, ArrowRight, Building } from "lucide-react";

const companies = [
  "Google", "Microsoft", "Apple", "Amazon", "Meta", "Netflix", "Tesla", "Spotify",
  "Airbnb", "Uber", "LinkedIn", "Twitter", "Adobe", "Salesforce", "Oracle",
  "IBM", "Intel", "NVIDIA", "Atlassian", "Dropbox", "Slack", "Zoom", "PayPal",
  "Square", "Stripe", "Coinbase", "Robinhood", "DoorDash", "Instacart", "Lyft",
  "Pinterest", "Snapchat", "TikTok", "Discord", "Reddit", "GitHub", "GitLab"
];

export default function CompanySelection() {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggleCompany = (company: string) => {
    setSelectedCompanies(prev => {
      if (prev.includes(company)) {
        return prev.filter(c => c !== company);
      } else if (prev.length < 5) {
        return [...prev, company];
      }
      return prev;
    });
  };

  const handleContinue = () => {
    if (selectedCompanies.length >= 3) {
      navigate('/feed');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <Card className="w-full max-w-5xl card-elevated">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <Building className="w-12 h-12 text-accent" />
          </div>
          <CardTitle className="text-3xl font-bold text-text-primary mb-2">
            Choose Companies
          </CardTitle>
          <p className="text-text-secondary text-lg">
            Select 3-5 companies whose alumni you'd like to connect with
          </p>
          <div className="flex justify-center mt-4">
            <Badge variant="outline" className="px-4 py-2">
              {selectedCompanies.length}/5 selected (min 3)
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {companies.map((company) => {
              const isSelected = selectedCompanies.includes(company);
              const isDisabled = !isSelected && selectedCompanies.length >= 5;
              
              return (
                <button
                  key={company}
                  onClick={() => toggleCompany(company)}
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
                    <span className="font-medium text-sm">{company}</span>
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

          <div className="flex justify-center pt-8">
            <Button 
              onClick={handleContinue}
              disabled={selectedCompanies.length < 3}
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