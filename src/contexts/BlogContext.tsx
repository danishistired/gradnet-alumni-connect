import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  accountType: 'student' | 'alumni';
  university: string;
  profilePicture?: string;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  author: Author;
  timeAgo: string;
  replies: Comment[];
}

interface BlogPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
  targetAudience: 'students' | 'alumni' | 'both';
  status: 'draft' | 'published';
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  author: Author;
  isLiked: boolean;
  timeAgo: string;
}

interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  tags: string[];
  category: string;
  targetAudience: 'students' | 'alumni' | 'both';
}

interface BlogFilters {
  category: string;
  authorType: 'student' | 'alumni' | 'all';
  sortBy: 'latest' | 'likes' | 'comments' | 'views';
}

interface BlogContextType {
  posts: BlogPost[];
  loading: boolean;
  filters: BlogFilters;
  totalPages: number;
  currentPage: number;
  
  // Actions
  fetchPosts: (page?: number) => Promise<void>;
  createPost: (postData: CreatePostData) => Promise<{ success: boolean; message: string; post?: BlogPost }>;
  likePost: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<{ success: boolean; message: string }>;
  setFilters: (filters: Partial<BlogFilters>) => void;
  refreshPosts: () => Promise<void>;
  
  // Comment actions
  fetchComments: (postId: string) => Promise<Comment[]>;
  addComment: (postId: string, content: string, parentId?: string) => Promise<{ success: boolean; message: string; comment?: Comment }>;
  deleteComment: (commentId: string) => Promise<{ success: boolean; message: string }>;
}

const BlogContext = createContext<BlogContextType | null>(null);

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

interface BlogProviderProps {
  children: ReactNode;
}

export const BlogProvider: React.FC<BlogProviderProps> = ({ children }) => {
  const { token } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFiltersState] = useState<BlogFilters>({
    category: 'all',
    authorType: 'all',
    sortBy: 'latest'
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  const fetchPosts = async (page = 1) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.authorType !== 'all' && { authorType: filters.authorType }),
        sortBy: filters.sortBy
      });

      const response = await fetch(`${API_BASE_URL}/posts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (page === 1) {
            setPosts(data.posts);
          } else {
            setPosts(prev => [...prev, ...data.posts]);
          }
          setTotalPages(data.totalPages);
          setCurrentPage(data.currentPage);
        }
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: CreatePostData) => {
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      const data = await response.json();
      
      if (data.success) {
        // Add new post to the beginning of the list
        setPosts(prev => [data.post, ...prev]);
        return { success: true, message: data.message, post: data.post };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      return { success: false, message: 'Failed to create post' };
    }
  };

  const likePost = async (postId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update post in local state
          setPosts(prev => prev.map(post => 
            post.id === postId 
              ? { ...post, isLiked: data.isLiked, likesCount: data.likesCount }
              : post
          ));
        }
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const deletePost = async (postId: string) => {
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove post from local state
        setPosts(prev => prev.filter(post => post.id !== postId));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      return { success: false, message: 'Failed to delete post' };
    }
  };

  const setFilters = (newFilters: Partial<BlogFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const refreshPosts = async () => {
    await fetchPosts(1);
  };

  // Comment functions
  const fetchComments = async (postId: string): Promise<Comment[]> => {
    if (!token) return [];

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.comments;
        }
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      return [];
    }
  };

  const addComment = async (postId: string, content: string, parentId?: string) => {
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, parentId })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update post's comment count in local state
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, commentsCount: post.commentsCount + 1 }
            : post
        ));
        return { success: true, message: data.message, comment: data.comment };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      return { success: false, message: 'Failed to add comment' };
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      return { success: false, message: 'Failed to delete comment' };
    }
  };

  // Fetch posts when filters change or component mounts
  useEffect(() => {
    if (token) {
      fetchPosts(1);
    }
  }, [token, filters]);

  const value: BlogContextType = {
    posts,
    loading,
    filters,
    totalPages,
    currentPage,
    fetchPosts,
    createPost,
    likePost,
    deletePost,
    setFilters,
    refreshPosts,
    fetchComments,
    addComment,
    deleteComment
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};
