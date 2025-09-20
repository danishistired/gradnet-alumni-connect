import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  GraduationCap, 
  Building, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  Check,
  X,
  BarChart3,
  CheckCircle,
  XCircle,
  FileText,
  Mail,
  University,
  Shield
} from 'lucide-react';
import { mockAlumni, mockEvents, Alumni } from '@/data/mockAlumni';
import { getAlumniFromDatabase, getPendingUsersFromDatabase, getDatabaseStatistics, fetchDatabaseData } from '@/utils/databaseUtils';
import AdminSidebar from '@/components/AdminSidebar';
import ContentModerationPanel from '@/components/ContentModerationPanel';

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

const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [alumniData, setAlumniData] = useState<Alumni[]>([]);
  const [statistics, setStatistics] = useState({
    totalAlumni: 0,
    approvedAlumni: 0,
    pendingVerifications: 0,
    rejectedAlumni: 0,
    uniqueCompanies: 0,
    totalStudents: 0,
    totalUsers: 0,
    totalPosts: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load data from database.json
  const loadDatabaseData = async () => {
    setIsLoading(true);
    try {
      const [alumni, pending, stats] = await Promise.all([
        getAlumniFromDatabase(),
        getPendingUsersFromDatabase(),
        getDatabaseStatistics()
      ]);
      
      // Transform alumni data to ensure correct types
      const transformedAlumni = alumni.map((alumnus: any) => ({
        ...alumnus,
        graduationYear: typeof alumnus.graduationYear === 'string' ? 
          parseInt(alumnus.graduationYear) : alumnus.graduationYear
      }));
      
      setAlumniData(transformedAlumni);
      setPendingUsers(pending);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading database data:', error);
      // Fallback to mock data if database loading fails
      setAlumniData(mockAlumni);
      setStatistics({
        totalAlumni: mockAlumni.length,
        approvedAlumni: mockAlumni.filter(a => a.verificationStatus === 'approved').length,
        pendingVerifications: mockAlumni.filter(a => a.verificationStatus === 'pending').length,
        rejectedAlumni: mockAlumni.filter(a => a.verificationStatus === 'rejected').length,
        uniqueCompanies: new Set(mockAlumni.map(a => a.company)).size,
        totalStudents: 0,
        totalUsers: mockAlumni.length,
        totalPosts: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount and when tab changes
  useEffect(() => {
    loadDatabaseData();
  }, []);

  // Load pending users when verification tab is selected
  useEffect(() => {
    if (selectedTab === 'verification') {
      loadPendingUsers();
    }
  }, [selectedTab]);

  // Calculate statistics from current data
  const totalAlumni = statistics.totalAlumni;
  const pendingVerifications = statistics.pendingVerifications;
  const approvedAlumni = statistics.approvedAlumni;
  const uniqueCompanies = statistics.uniqueCompanies;

  // Filter alumni based on search and filters
  const filteredAlumni = alumniData.filter(alumni => {
    const matchesSearch = alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alumni.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alumni.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || alumni.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || alumni.verificationStatus === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Load pending users for verification
  const loadPendingUsers = async () => {
    setIsLoading(true);
    try {
      // Try to fetch from API first (if backend server is running)
      const response = await fetch('http://localhost:5000/api/admin/pending-alumni');
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          const transformedUsers = data.pendingAlumni.map((user: any) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            university: user.university,
            graduationYear: user.graduationYear,
            degree: user.degree || 'Computer Science',
            registrationDate: new Date(user.createdAt).toLocaleDateString(),
            proofDocument: user.proofDocument
          }));
          setPendingUsers(transformedUsers);
        }
      } else {
        throw new Error('API not available, using database.json');
      }
    } catch (error) {
      console.log('API not available, loading from database.json:', error);
      // Fallback to database.json
      try {
        const pendingFromDatabase = await getPendingUsersFromDatabase();
        setPendingUsers(pendingFromDatabase);
      } catch (dbError) {
        console.error('Error loading from database.json:', dbError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/approve-alumni/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        alert('User approved successfully!');
      } else {
        alert('Error approving user: ' + data.message);
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Error approving user. Please try again.');
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      const reason = prompt('Please provide a reason for rejection (optional):');
      
      const response = await fetch(`http://localhost:5000/api/admin/reject-alumni/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        alert('User rejected successfully!');
      } else {
        alert('Error rejecting user: ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Error rejecting user. Please try again.');
    }
  };

  const viewDocument = (document: { name: string; url: string; type: string }) => {
    window.open(document.url, '_blank');
  };

  // Load pending users when verification tab is selected
  React.useEffect(() => {
    if (selectedTab === 'verification') {
      loadPendingUsers();
    }
  }, [selectedTab]);

  const handleVerification = (alumniId: string, action: 'approve' | 'reject') => {
    // In real app, this would make an API call
    console.log(`${action} alumni with ID: ${alumniId}`);
  };

  const handleExportData = async (exportAll = false) => {
    try {
      // Show loading state
      setIsLoading(true);
      
      // Get fresh data from database if exporting all
      const rawData = exportAll ? await getAlumniFromDatabase() : filteredAlumni;
      
      // Transform data to ensure correct types
      const dataToExport = rawData.map((alumnus: any) => ({
        ...alumnus,
        graduationYear: typeof alumnus.graduationYear === 'string' ? 
          parseInt(alumnus.graduationYear) : alumnus.graduationYear
      }));
      
      if (dataToExport.length === 0) {
        alert('No alumni data to export.');
        return;
      }

      // Enhanced CSV headers with more database fields
      const csvHeaders = [
        'ID',
        'Name',
        'First Name',
        'Last Name', 
        'Email',
        'Department',
        'Company',
        'Job Title',
        'Graduation Year',
        'Location',
        'Verification Status',
        'Registration Date',
        'Bio',
        'Skills',
        'LinkedIn',
        'GitHub',
        'Website',
        'University'
      ];

      // Convert alumni data to CSV format with actual database fields
      const csvData = dataToExport.map(alumni => [
        alumni.id,
        alumni.name,
        alumni.name.split(' ')[0] || '', // First name
        alumni.name.split(' ').slice(1).join(' ') || '', // Last name
        alumni.email,
        alumni.department,
        alumni.company,
        alumni.currentJobTitle || alumni.jobTitle || '',
        alumni.graduationYear,
        alumni.location,
        alumni.verificationStatus,
        alumni.registrationDate || new Date().toLocaleDateString(),
        alumni.bio || '',
        Array.isArray(alumni.skills) ? alumni.skills.join('; ') : '',
        alumni.linkedIn || '',
        alumni.github || '',
        alumni.website || '',
        'Chandigarh University' // Default university
      ]);

      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.map(field => 
          // Escape commas and quotes in CSV fields
          typeof field === 'string' && (field.includes(',') || field.includes('"')) 
            ? `"${field.replace(/"/g, '""')}"` 
            : field
        ).join(','))
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        const fileName = exportAll 
          ? `all_alumni_data_${new Date().toISOString().split('T')[0]}.csv`
          : `filtered_alumni_data_${new Date().toISOString().split('T')[0]}.csv`;
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        const exportType = exportAll ? 'All alumni' : 'Filtered alumni';
        alert(`${exportType} data (${dataToExport.length} records) exported successfully!`);
      } else {
        throw new Error('Download not supported in this browser');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPendingUsers = () => {
    try {
      if (pendingUsers.length === 0) {
        alert('No pending users to export.');
        return;
      }

      // Prepare CSV data for pending users
      const csvHeaders = [
        'First Name',
        'Last Name',
        'Email',
        'University',
        'Graduation Year',
        'Degree',
        'Registration Date',
        'Has Proof Document'
      ];

      // Convert pending users data to CSV format
      const csvData = pendingUsers.map(user => [
        user.firstName,
        user.lastName,
        user.email,
        user.university,
        user.graduationYear,
        user.degree,
        user.registrationDate,
        user.proofDocument ? 'Yes' : 'No'
      ]);

      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.map(field => 
          // Escape commas and quotes in CSV fields
          typeof field === 'string' && (field.includes(',') || field.includes('"')) 
            ? `"${field.replace(/"/g, '""')}"` 
            : field
        ).join(','))
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `pending_users_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        alert('Pending users data exported successfully!');
      } else {
        throw new Error('Download not supported in this browser');
      }
    } catch (error) {
      console.error('Error exporting pending users data:', error);
      alert('Error exporting pending users data. Please try again.');
    }
  };

  // Export all user data (alumni and students)
  const handleExportAllUsers = async () => {
    try {
      setIsLoading(true);
      const allUsersData = await fetchDatabaseData();
      
      if (allUsersData.users.length === 0) {
        alert('No user data to export.');
        return;
      }

      const csvHeaders = [
        'ID',
        'First Name',
        'Last Name',
        'Email',
        'Account Type',
        'University',
        'Graduation Year',
        'Company',
        'Job Title',
        'Location',
        'Registration Date',
        'Approval Status',
        'Bio',
        'Skills'
      ];

      const csvData = allUsersData.users.map(user => [
        user.id,
        user.firstName,
        user.lastName,
        user.email,
        user.accountType,
        user.university,
        user.graduationYear,
        user.company || '',
        user.jobTitle || '',
        user.location || '',
        new Date(user.createdAt).toLocaleDateString(),
        user.accountType === 'alumni' ? 
          (user.isApproved === true ? 'Approved' : 
           user.isApproved === false ? 'Rejected' : 'Pending') : 
          'N/A',
        user.bio || '',
        Array.isArray(user.skills) ? user.skills.join('; ') : ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.map(field => 
          typeof field === 'string' && (field.includes(',') || field.includes('"')) 
            ? `"${field.replace(/"/g, '""')}"` 
            : field
        ).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `all_users_data_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert(`All users data (${allUsersData.users.length} records) exported successfully!`);
      }
    } catch (error) {
      console.error('Error exporting all users data:', error);
      alert('Error exporting all users data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  const AlumniTable = ({ alumni }: { alumni: Alumni[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Program</TableHead>
          <TableHead>Graduation Year</TableHead>
          <TableHead>Current Role</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alumni.map((alumni) => (
          <TableRow key={alumni.id}>
            <TableCell className="font-medium">{alumni.name}</TableCell>
            <TableCell>{alumni.program}</TableCell>
            <TableCell>{alumni.graduationYear}</TableCell>
            <TableCell>{alumni.currentJobTitle}</TableCell>
            <TableCell>{alumni.company}</TableCell>
            <TableCell>
              <Badge 
                variant={
                  alumni.verificationStatus === 'approved' ? 'default' :
                  alumni.verificationStatus === 'pending' ? 'secondary' : 'destructive'
                }
              >
                {alumni.verificationStatus}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                {alumni.verificationStatus === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleVerification(alumni.id, 'approve')}
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleVerification(alumni.id, 'reject')}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Institution Admin Portal</h1>
            <p className="text-muted-foreground">Manage your alumni network</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadDatabaseData} variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            
            {/* Export Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleExportData(false)}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Filtered Alumni
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportData(true)}>
                  <Download className="mr-2 h-4 w-4" />
                  Export All Alumni
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportAllUsers}>
                  <Download className="mr-2 h-4 w-4" />
                  Export All Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPendingUsers}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Pending Users
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alumni">Alumni Management</TabsTrigger>
            <TabsTrigger value="verification">Verification Queue</TabsTrigger>
            <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Total Alumni" 
                value={totalAlumni} 
                icon={Users} 
                color="text-blue-600" 
              />
              <StatCard 
                title="Pending Verifications" 
                value={pendingVerifications} 
                icon={GraduationCap} 
                color="text-yellow-600" 
              />
              <StatCard 
                title="Approved Alumni" 
                value={approvedAlumni} 
                icon={Check} 
                color="text-green-600" 
              />
              <StatCard 
                title="Companies Represented" 
                value={uniqueCompanies} 
                icon={Building} 
                color="text-purple-600" 
              />
            </div>

            {/* Additional Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard 
                title="Total Students" 
                value={statistics.totalStudents} 
                icon={University} 
                color="text-indigo-600" 
              />
              <StatCard 
                title="Total Users" 
                value={statistics.totalUsers} 
                icon={Users} 
                color="text-gray-600" 
              />
              <StatCard 
                title="Total Posts" 
                value={statistics.totalPosts} 
                icon={FileText} 
                color="text-orange-600" 
              />
            </div>

            {/* Recent Alumni */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Registrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlumniTable alumni={mockAlumni.slice(0, 5)} />
              </CardContent>
            </Card>

            {/* Quick Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Alumni by Department
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Engineering', 'Business', 'Liberal Arts'].map(dept => {
                      const count = mockAlumni.filter(a => a.department === dept).length;
                      const percentage = Math.round((count / totalAlumni) * 100);
                      return (
                        <div key={dept} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{dept}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockEvents.filter(e => e.status === 'upcoming').map(event => (
                      <div key={event.id} className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{event.date}</p>
                        </div>
                        <Badge variant="outline">{event.attendees} attending</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alumni" className="space-y-4">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search alumni..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Liberal Arts">Liberal Arts</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Alumni Table */}
            <Card>
              <CardHeader>
                <CardTitle>Alumni Directory ({filteredAlumni.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <AlumniTable alumni={filteredAlumni} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading pending verifications...</p>
                </CardContent>
              </Card>
            ) : pendingUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No pending requests</h3>
                  <p className="text-muted-foreground">All alumni applications have been processed.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Pending Verifications ({pendingUsers.length})</h2>
                  <div className="flex gap-2">
                    <Button onClick={handleExportPendingUsers} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Pending
                    </Button>
                    <Button onClick={loadPendingUsers} variant="outline">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                {pendingUsers.map((user) => (
                  <Card key={user.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {user.firstName[0]}{user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">
                              {user.firstName} {user.lastName}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground flex items-center">
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
                          <h4 className="font-medium flex items-center">
                            <University className="w-4 h-4 mr-2" />
                            Academic Information
                          </h4>
                          <div className="space-y-2 pl-6">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">University:</span>
                              <span className="text-sm font-medium">{user.university}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Degree:</span>
                              <span className="text-sm font-medium">{user.degree}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Graduation Year:</span>
                              <span className="text-sm font-medium">{user.graduationYear}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Applied:</span>
                              <span className="text-sm font-medium flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {user.registrationDate}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Document Verification */}
                        <div className="space-y-4">
                          <h4 className="font-medium flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Verification Document
                          </h4>
                          {user.proofDocument ? (
                            <div className="pl-6">
                              <div className="bg-muted rounded-lg p-4 border">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium">
                                      {user.proofDocument.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground uppercase">
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
                                      onClick={() => window.open(user.proofDocument!.url)}
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
                          className="text-destructive border-destructive/20 hover:bg-destructive/10"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleApproveUser(user.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Alumni
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  Content Moderation
                </h2>
                <p className="text-muted-foreground">
                  Monitor and review flagged content, manage user warnings
                </p>
              </div>
            </div>

            <ContentModerationPanel />
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Event Management</h2>
              <Button>Create New Event</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockEvents.map(event => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge 
                      variant={event.status === 'upcoming' ? 'default' : 'secondary'}
                    >
                      {event.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {event.date}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        📍 {event.location}
                      </p>
                      <p className="text-sm">{event.description}</p>
                      <p className="text-sm font-medium">
                        {event.attendees} attendees
                      </p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;