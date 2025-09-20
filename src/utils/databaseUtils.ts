// Utility functions to read data from database.json file

export interface DatabaseUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: 'student' | 'alumni' | 'admin';
  university: string;
  graduationYear: string;
  bio?: string;
  skills?: string[];
  company?: string;
  jobTitle?: string;
  linkedIn?: string;
  github?: string;
  website?: string;
  location?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt?: string;
  isApproved?: boolean;
  rejectionReason?: string;
}

export interface DatabaseData {
  users: DatabaseUser[];
  posts: any[];
  communities: any[];
}

// Function to read data from backend API or database.json fallback
export const fetchDatabaseData = async (): Promise<DatabaseData> => {
  try {
    // First try to fetch from the backend API
    const apiResponse = await fetch('http://localhost:5000/api/admin/all-users');
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      if (apiData.success) {
        // Transform API response to match expected format
        return {
          users: apiData.users || [],
          posts: apiData.posts || [],
          communities: apiData.communities || []
        };
      }
    }
    
    // Fallback to static database.json file
    console.log('API not available, falling back to static database.json');
    const response = await fetch('/database.json');
    if (!response.ok) {
      throw new Error('Failed to fetch database data from both API and static file');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching database data:', error);
    throw error;
  }
};

// Function to get all alumni (approved and pending)
export const getAlumniFromDatabase = async () => {
  try {
    const data = await fetchDatabaseData();
    const alumni = data.users.filter(user => user.accountType === 'alumni');
    
    return alumni.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      department: 'Computer Science', // Default since not in database
      company: user.company || 'Not specified',
      graduationYear: user.graduationYear,
      location: user.location || 'Not specified',
      verificationStatus: user.isApproved === true ? 'approved' : 
                         user.isApproved === false ? 'rejected' : 'pending',
      program: 'Bachelor of Technology', // Default since not in database
      currentJobTitle: user.jobTitle || 'Not specified',
      profilePicture: user.profilePicture,
      bio: user.bio,
      skills: user.skills || [],
      linkedIn: user.linkedIn,
      github: user.github,
      website: user.website,
      registrationDate: new Date(user.createdAt).toLocaleDateString(),
      rejectionReason: user.rejectionReason
    }));
  } catch (error) {
    console.error('Error getting alumni from database:', error);
    return [];
  }
};

// Function to get pending users for verification
export const getPendingUsersFromDatabase = async () => {
  try {
    const data = await fetchDatabaseData();
    const pendingUsers = data.users.filter(user => 
      user.accountType === 'alumni' && user.isApproved !== true
    );
    
    return pendingUsers.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      university: user.university,
      graduationYear: user.graduationYear,
      degree: 'Computer Science', // Default since not in database
      registrationDate: new Date(user.createdAt).toLocaleDateString(),
      bio: user.bio,
      skills: user.skills || [],
      company: user.company,
      jobTitle: user.jobTitle,
      location: user.location,
      profilePicture: user.profilePicture,
      isApproved: user.isApproved,
      rejectionReason: user.rejectionReason
    }));
  } catch (error) {
    console.error('Error getting pending users from database:', error);
    return [];
  }
};

// Function to get statistics from database
export const getDatabaseStatistics = async () => {
  try {
    const data = await fetchDatabaseData();
    const alumni = data.users.filter(user => user.accountType === 'alumni');
    const students = data.users.filter(user => user.accountType === 'student');
    
    const totalAlumni = alumni.length;
    const approvedAlumni = alumni.filter(user => user.isApproved === true).length;
    const pendingVerifications = alumni.filter(user => user.isApproved !== true).length;
    const rejectedAlumni = alumni.filter(user => user.isApproved === false).length;
    
    // Get unique companies (excluding empty/null values)
    const companies = alumni
      .map(user => user.company)
      .filter(company => company && company.trim() !== '');
    const uniqueCompanies = new Set(companies).size;
    
    return {
      totalAlumni,
      approvedAlumni,
      pendingVerifications,
      rejectedAlumni,
      uniqueCompanies,
      totalStudents: students.length,
      totalUsers: data.users.length,
      totalPosts: data.posts?.length || 0
    };
  } catch (error) {
    console.error('Error getting database statistics:', error);
    return {
      totalAlumni: 0,
      approvedAlumni: 0,
      pendingVerifications: 0,
      rejectedAlumni: 0,
      uniqueCompanies: 0,
      totalStudents: 0,
      totalUsers: 0,
      totalPosts: 0
    };
  }
};