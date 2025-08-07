import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, XCircle, FileText, Calendar, Mail, Building } from "lucide-react";
import { Navbar } from "@/components/Navbar";

interface VerificationRequest {
  id: string;
  name: string;
  email: string;
  college: string;
  graduationYear: string;
  currentCompany: string;
  documentType: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'denied';
}

const mockRequests: VerificationRequest[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@gmail.com",
    college: "Stanford University",
    graduationYear: "2019",
    currentCompany: "Google",
    documentType: "Degree Certificate",
    submittedAt: "2024-01-15",
    status: "pending"
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    email: "m.rodriguez@outlook.com",
    college: "UC Berkeley",
    graduationYear: "2018",
    currentCompany: "Spotify",
    documentType: "Official Transcript",
    submittedAt: "2024-01-14",
    status: "pending"
  },
  {
    id: "3",
    name: "Emily Zhang",
    email: "emily.zhang@yahoo.com",
    college: "MIT",
    graduationYear: "2020",
    currentCompany: "Netflix",
    documentType: "Alumni ID Card",
    submittedAt: "2024-01-13",
    status: "pending"
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@gmail.com",
    college: "Carnegie Mellon",
    graduationYear: "2017",
    currentCompany: "Apple",
    documentType: "Degree Certificate",
    submittedAt: "2024-01-12",
    status: "approved"
  },
  {
    id: "5",
    name: "Lisa Wang",
    email: "lisa.wang@hotmail.com",
    college: "Georgia Tech",
    graduationYear: "2021",
    currentCompany: "Microsoft",
    documentType: "Official Transcript",
    submittedAt: "2024-01-11",
    status: "denied"
  }
];

export default function AdminPanel() {
  const [requests, setRequests] = useState<VerificationRequest[]>(mockRequests);

  const handleVerification = (id: string, action: 'approve' | 'deny') => {
    setRequests(prev => 
      prev.map(req => 
        req.id === id 
          ? { ...req, status: action === 'approve' ? 'approved' : 'denied' }
          : req
      )
    );
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  return (
    <div className="min-h-screen bg-surface">
      <Navbar user={{ type: 'admin', verified: true }} />
      
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Admin Panel</h1>
          <p className="text-text-secondary">Manage alumni verification requests</p>
        </div>

        {/* Pending Requests */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Pending Requests</h2>
            <Badge variant="secondary" className="bg-accent-light text-accent">
              {pendingRequests.length} pending
            </Badge>
          </div>
          
          <div className="grid gap-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-accent-light text-accent font-semibold">
                          {request.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-text-primary text-lg">{request.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {request.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              {request.currentCompany}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-text-muted">College:</span>
                            <p className="text-text-primary font-medium">{request.college}</p>
                          </div>
                          <div>
                            <span className="text-text-muted">Graduation:</span>
                            <p className="text-text-primary font-medium">Class of {request.graduationYear}</p>
                          </div>
                          <div>
                            <span className="text-text-muted">Document:</span>
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4 text-text-secondary" />
                              <p className="text-text-primary font-medium">{request.documentType}</p>
                            </div>
                          </div>
                          <div>
                            <span className="text-text-muted">Submitted:</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-text-secondary" />
                              <p className="text-text-primary font-medium">{request.submittedAt}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerification(request.id, 'deny')}
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Deny
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleVerification(request.id, 'approve')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Decisions */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-6">Recent Decisions</h2>
          
          <div className="grid gap-3">
            {processedRequests.map((request) => (
              <Card key={request.id} className="card-elevated opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-surface-muted text-text-muted text-xs">
                          {request.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-text-primary">{request.name}</p>
                        <p className="text-sm text-text-secondary">{request.college} • {request.currentCompany}</p>
                      </div>
                    </div>
                    
                    <Badge 
                      variant={request.status === 'approved' ? 'default' : 'destructive'}
                      className={request.status === 'approved' 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : ''
                      }
                    >
                      {request.status === 'approved' ? 'Approved' : 'Denied'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}