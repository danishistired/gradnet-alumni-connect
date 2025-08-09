import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface ProfileData {
  firstName: string;
  lastName: string;
  bio: string;
  skills: string[];
  company: string;
  jobTitle: string;
  linkedIn: string;
  github: string;
  website: string;
  location: string;
  university: string;
  graduationYear: string;
}

interface ProfileContextType {
  updateProfile: (profileData: ProfileData) => Promise<{ success: boolean; message: string }>;
  updateProfilePicture: (imageData: string) => Promise<{ success: boolean; message: string }>;
  isUpdating: boolean;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { token } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const API_BASE_URL = 'http://localhost:5000/api';

  const updateProfile = async (profileData: ProfileData) => {
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      return { success: false, message: 'Failed to update profile' };
    } finally {
      setIsUpdating(false);
    }
  };

  const updateProfilePicture = async (imageData: string) => {
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/profile/picture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profilePicture: imageData })
      });

      const data = await response.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      return { success: false, message: 'Failed to upload image' };
    } finally {
      setIsUpdating(false);
    }
  };

  const value: ProfileContextType = {
    updateProfile,
    updateProfilePicture,
    isUpdating
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
