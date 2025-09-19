import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";

export default function AlumniVerification() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setUploadedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    // Simulate document upload
    alert("Document submitted for verification! You'll receive an email once reviewed.");
    navigate('/feed');
  };

  const mockPosts = [
    {
      id: 1,
      author: "Sarah Chen",
      role: "Software Engineer at Google",
      college: "Stanford University",
      title: "Building Scalable React Applications",
      preview: "Here are my top 5 tips for creating maintainable React apps at scale...",
      upvotes: 342,
      comments: 28
    },
    {
      id: 2,
      author: "Michael Rodriguez",
      role: "Product Manager at Spotify",
      college: "UC Berkeley",
      title: "From CS Student to Product Manager",
      preview: "My journey transitioning from engineering to product management...",
      upvotes: 156,
      comments: 15
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Verification Alert */}
        <Alert className="mb-6 border-accent bg-accent-light">
          <AlertCircle className="h-4 w-4 text-accent" />
          <AlertDescription className="text-text-primary">
            <strong>Alumni verification required.</strong> Please upload a valid document (graduation certificate, alumni ID, or degree) to access posting and commenting features.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Upload */}
          <div className="lg:col-span-1">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  Document Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                    dragActive 
                      ? 'border-accent bg-accent-light' 
                      : 'border-border hover:border-accent/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                  <p className="text-text-secondary mb-2">
                    Drag and drop your document here, or
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                    />
                    <span className="text-accent hover:underline font-medium">
                      browse files
                    </span>
                  </label>
                </div>

                {uploadedFile && (
                  <div className="flex items-center gap-2 p-3 bg-surface-muted rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-text-primary">{uploadedFile.name}</span>
                  </div>
                )}

                <div className="text-xs text-text-muted">
                  <p className="font-medium mb-1">Accepted formats:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Graduation certificate or diploma</li>
                    <li>Alumni ID card</li>
                    <li>University transcripts</li>
                    <li>PDF, JPG, or PNG files only</li>
                  </ul>
                </div>

                <Button 
                  className="w-full btn-accent" 
                  disabled={!uploadedFile}
                  onClick={handleSubmit}
                >
                  Submit Document
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Read-Only Feed Preview */}
          <div className="lg:col-span-2">
            <div className="relative">
              {/* Disabled Overlay */}
              <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
                <div className="text-center p-6">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-accent" />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Read Only Mode
                  </h3>
                  <p className="text-text-secondary">
                    Complete verification to interact with posts
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-text-primary">Alumni Blogs</h2>
                  <Button variant="outline" disabled>
                    Post Blog
                  </Button>
                </div>

                {mockPosts.map((post) => (
                  <Card key={post.id} className="card-elevated">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-accent-light rounded-full flex items-center justify-center">
                          <span className="text-accent font-semibold">
                            {post.author.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-text-primary">{post.author}</h3>
                            <span className="text-text-muted text-sm">•</span>
                            <span className="text-text-secondary text-sm">{post.role}</span>
                          </div>
                          <p className="text-text-muted text-sm mb-3">{post.college}</p>
                          <h4 className="font-medium text-text-primary mb-2">{post.title}</h4>
                          <p className="text-text-secondary text-sm mb-4">{post.preview}</p>
                          <div className="flex items-center gap-4 text-sm text-text-muted">
                            <span>↑ {post.upvotes}</span>
                            <span>💬 {post.comments}</span>
                            <span>🔗 Share</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}