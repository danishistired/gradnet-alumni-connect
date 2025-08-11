import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Calendar, 
  Mail, 
  University,
  LogOut,
  Eye,
  Download
} from 'lucide-react';

interface PendingUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  graduationYear: string;
  degree: string;
  registrationDate: string;
  proofDocument?: {
    name: string;
    url: string;
    type: string;
  };
}

const AdminPanel = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check admin authentication
  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      navigate('/admin');
      return;
    }
    loadPendingUsers();
  }, [navigate]);

  const loadPendingUsers = async () => {
    try {
      // Simulate loading pending users from backend
      const mockPendingUsers: PendingUser[] = [
        {
          id: '1',
          firstName: 'Rajesh',
          lastName: 'Kumar',
          email: 'rajesh.kumar@email.com',
          university: 'Chandigarh University',
          graduationYear: '2022',
          degree: 'Computer Science Engineering',
          registrationDate: '2024-08-10',
          proofDocument: {
            name: 'degree_certificate.pdf',
            url: '/mock-documents/degree_cert_1.pdf',
            type: 'pdf'
          }
        },
        {
          id: '2',
          firstName: 'Priya',
          lastName: 'Sharma',
          email: 'priya.sharma@email.com',
          university: 'Chandigarh University',
          graduationYear: '2021',
          degree: 'Mechanical Engineering',
          registrationDate: '2024-08-11',
          proofDocument: {
            name: 'transcript.pdf',
            url: '/mock-documents/transcript_2.pdf',
            type: 'pdf'
          }
        },
        {
          id: '3',
          firstName: 'Amit',
          lastName: 'Singh',
          email: 'amit.singh@email.com',
          university: 'Chandigarh University',
          graduationYear: '2020',
          degree: 'MBA',
          registrationDate: '2024-08-12',
          proofDocument: {
            name: 'alumni_id_card.jpg',
            url: '/mock-documents/id_card_3.jpg',
            type: 'image'
          }
        }
      ];
      
      setPendingUsers(mockPendingUsers);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading pending users:', error);
      setIsLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      console.log('Approving user:', userId);
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      alert('User approved successfully!');
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Error approving user. Please try again.');
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      console.log('Rejecting user:', userId);
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      alert('User rejected successfully!');
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Error rejecting user. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    navigate('/');
  };

  const viewDocument = (document: { name: string; url: string; type: string }) => {
    alert(`Viewing document: ${document.name}\nType: ${document.type}\nURL: ${document.url}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Alumni Approval System</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Pending Requests ({pendingUsers.length})
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Users className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            {pendingUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                  <p className="text-gray-600">All alumni applications have been processed.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {pendingUsers.map((user) => (
                  <Card key={user.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-indigo-100 text-indigo-600">
                              {user.firstName[0]}{user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">
                              {user.firstName} {user.lastName}
                            </CardTitle>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Pending Review
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* User Information */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900 flex items-center">
                            <University className="w-4 h-4 mr-2" />
                            Academic Information
                          </h4>
                          <div className="space-y-2 pl-6">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">University:</span>
                              <span className="text-sm font-medium">{user.university}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Degree:</span>
                              <span className="text-sm font-medium">{user.degree}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Graduation Year:</span>
                              <span className="text-sm font-medium">{user.graduationYear}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Applied:</span>
                              <span className="text-sm font-medium flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(user.registrationDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Document Verification */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900 flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Verification Document
                          </h4>
                          {user.proofDocument ? (
                            <div className="pl-6">
                              <div className="bg-gray-50 rounded-lg p-4 border">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {user.proofDocument.name}
                                    </p>
                                    <p className="text-xs text-gray-600 uppercase">
                                      {user.proofDocument.type} document
                                    </p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => viewDocument(user.proofDocument!)}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                    >
                                      <Download className="w-3 h-3 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <Alert>
                              <AlertDescription>
                                No verification document uploaded
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                        <Button
                          variant="outline"
                          onClick={() => handleRejectUser(user.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleApproveUser(user.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Total Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{pendingUsers.length}</div>
                  <p className="text-xs text-gray-600">Awaiting review</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Approved Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <p className="text-xs text-gray-600">New approvals</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Total Alumni</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">156</div>
                  <p className="text-xs text-gray-600">Active members</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
