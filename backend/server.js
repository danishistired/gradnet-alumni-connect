const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-super-secret-jwt-key'; // In production, use environment variable

// Middleware
app.use(cors());
app.use(express.json());

// Database file path (using JSON file for simplicity)
const DB_FILE = path.join(__dirname, 'database.json');

// Initialize database file if it doesn't exist
async function initializeDB() {
  try {
    await fs.access(DB_FILE);
  } catch (error) {
    // File doesn't exist, create it
    await fs.writeFile(DB_FILE, JSON.stringify({ 
      users: [], 
      posts: [], 
      comments: [], 
      likes: [] 
    }, null, 2));
  }
}

// Read from database
async function readDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    const db = JSON.parse(data);
    
    // Ensure all required arrays exist
    if (!db.users) db.users = [];
    if (!db.posts) db.posts = [];
    if (!db.comments) db.comments = [];
    if (!db.likes) db.likes = [];
    
    return db;
  } catch (error) {
    return { users: [], posts: [], comments: [], likes: [] };
  }
}

// Write to database
async function writeDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// Email validation function
function isValidEmail(email, accountType) {
  if (accountType === 'student') {
    return email.endsWith('@cuchd.in');
  }
  // For alumni, any valid email format
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      accountType, 
      university, 
      graduationYear 
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !accountType) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Email validation
    if (!isValidEmail(email, accountType)) {
      return res.status(400).json({ 
        success: false, 
        message: accountType === 'student' 
          ? 'Students must use their @cuchd.in email address'
          : 'Please enter a valid email address'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    const db = await readDB();

    // Check if user already exists
    const existingUser = db.users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
      university: university || '',
      graduationYear: graduationYear || '',
      profilePicture: null,
      bio: '',
      skills: [],
      company: '',
      jobTitle: '',
      linkedIn: '',
      github: '',
      website: '',
      location: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.push(newUser);
    await writeDB(db);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, accountType: newUser.accountType },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        accountType: newUser.accountType,
        university: newUser.university,
        graduationYear: newUser.graduationYear,
        profilePicture: newUser.profilePicture
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, accountType } = req.body;

    // Validation
    if (!email || !password || !accountType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, and account type are required' 
      });
    }

    // Email validation
    if (!isValidEmail(email, accountType)) {
      return res.status(400).json({ 
        success: false, 
        message: accountType === 'student' 
          ? 'Students must use their @cuchd.in email address'
          : 'Please enter a valid email address'
      });
    }

    const db = await readDB();

    // Find user
    const user = db.users.find(u => u.email === email && u.accountType === accountType);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or account type' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, accountType: user.accountType },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType: user.accountType,
        university: user.university,
        graduationYear: user.graduationYear,
        profilePicture: user.profilePicture || null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const user = db.users.find(u => u.id === req.user.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType: user.accountType,
        university: user.university,
        graduationYear: user.graduationYear,
        profilePicture: user.profilePicture || null,
        bio: user.bio || '',
        skills: user.skills || [],
        company: user.company || '',
        jobTitle: user.jobTitle || '',
        linkedIn: user.linkedIn || '',
        github: user.github || '',
        website: user.website || '',
        location: user.location || ''
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Update user profile
app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      bio, 
      skills, 
      company, 
      jobTitle, 
      linkedIn, 
      github, 
      website, 
      location, 
      university,
      graduationYear 
    } = req.body;

    const db = await readDB();
    const userIndex = db.users.findIndex(u => u.id === req.user.userId);

    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update user profile
    db.users[userIndex] = {
      ...db.users[userIndex],
      firstName: firstName || db.users[userIndex].firstName,
      lastName: lastName || db.users[userIndex].lastName,
      bio: bio || '',
      skills: skills || [],
      company: company || '',
      jobTitle: jobTitle || '',
      linkedIn: linkedIn || '',
      github: github || '',
      website: website || '',
      location: location || '',
      university: university || db.users[userIndex].university,
      graduationYear: graduationYear || db.users[userIndex].graduationYear,
      updatedAt: new Date().toISOString()
    };

    await writeDB(db);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: db.users[userIndex].id,
        firstName: db.users[userIndex].firstName,
        lastName: db.users[userIndex].lastName,
        email: db.users[userIndex].email,
        accountType: db.users[userIndex].accountType,
        university: db.users[userIndex].university,
        graduationYear: db.users[userIndex].graduationYear,
        profilePicture: db.users[userIndex].profilePicture,
        bio: db.users[userIndex].bio,
        skills: db.users[userIndex].skills,
        company: db.users[userIndex].company,
        jobTitle: db.users[userIndex].jobTitle,
        linkedIn: db.users[userIndex].linkedIn,
        github: db.users[userIndex].github,
        website: db.users[userIndex].website,
        location: db.users[userIndex].location
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Update profile picture
app.post('/api/profile/picture', authenticateToken, async (req, res) => {
  try {
    const { profilePicture } = req.body;

    if (!profilePicture) {
      return res.status(400).json({ 
        success: false, 
        message: 'Profile picture data is required' 
      });
    }

    const db = await readDB();
    const userIndex = db.users.findIndex(u => u.id === req.user.userId);

    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update profile picture (store as base64 or URL)
    db.users[userIndex].profilePicture = profilePicture;
    db.users[userIndex].updatedAt = new Date().toISOString();

    await writeDB(db);

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      profilePicture: profilePicture
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Blog/Post endpoints

// Get all posts with filtering and pagination
app.get('/api/posts', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, authorType, sortBy = 'latest' } = req.query;
    const userAccountType = req.user.accountType;
    
    const db = await readDB();
    let filteredPosts = db.posts.filter(post => post.status === 'published');
    
    // Filter by author type if specified
    if (authorType) {
      filteredPosts = filteredPosts.filter(post => {
        const author = db.users.find(u => u.id === post.authorId);
        return author && author.accountType === authorType;
      });
    }
    
    // Filter by category if specified
    if (category && category !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.category === category);
    }
    
    // Sort posts
    filteredPosts.sort((a, b) => {
      switch (sortBy) {
        case 'likes': return b.likesCount - a.likesCount;
        case 'comments': return b.commentsCount - a.commentsCount;
        case 'views': return b.viewsCount - a.viewsCount;
        default: return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + parseInt(limit));
    
    // Add author information and like status
    const postsWithDetails = paginatedPosts.map(post => {
      const author = db.users.find(u => u.id === post.authorId);
      const isLiked = db.likes.some(like => like.postId === post.id && like.userId === req.user.userId);
      
      return {
        ...post,
        author: author ? {
          id: author.id,
          firstName: author.firstName,
          lastName: author.lastName,
          accountType: author.accountType,
          university: author.university,
          profilePicture: author.profilePicture
        } : null,
        isLiked,
        timeAgo: getTimeAgo(post.createdAt)
      };
    });
    
    res.json({
      success: true,
      posts: postsWithDetails,
      totalPosts: filteredPosts.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(filteredPosts.length / limit)
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Create new post
app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, excerpt, tags, category, targetAudience } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and content are required' 
      });
    }
    
    const db = await readDB();
    
    const newPost = {
      id: Date.now().toString(),
      authorId: req.user.userId,
      title,
      content,
      excerpt: excerpt || content.substring(0, 150).replace(/[#*`]/g, '') + '...',
      tags: tags || [],
      category: category || 'general',
      targetAudience: targetAudience || 'both',
      status: 'published',
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString()
    };
    
    db.posts.push(newPost);
    await writeDB(db);
    
    // Get author info for response
    const author = db.users.find(u => u.id === req.user.userId);
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: {
        ...newPost,
        author: {
          id: author.id,
          firstName: author.firstName,
          lastName: author.lastName,
          accountType: author.accountType,
          university: author.university,
          profilePicture: author.profilePicture
        },
        isLiked: false,
        timeAgo: 'Just now'
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get single post
app.get('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const post = db.posts.find(p => p.id === req.params.id);
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }
    
    // Increment view count
    post.viewsCount++;
    await writeDB(db);
    
    // Get author info
    const author = db.users.find(u => u.id === post.authorId);
    const isLiked = db.likes.some(like => like.postId === post.id && like.userId === req.user.userId);
    
    res.json({
      success: true,
      post: {
        ...post,
        author: author ? {
          id: author.id,
          firstName: author.firstName,
          lastName: author.lastName,
          accountType: author.accountType,
          university: author.university,
          profilePicture: author.profilePicture
        } : null,
        isLiked,
        timeAgo: getTimeAgo(post.createdAt)
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Like/Unlike post
app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.userId;
    
    const db = await readDB();
    const post = db.posts.find(p => p.id === postId);
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }
    
    const existingLike = db.likes.find(l => l.postId === postId && l.userId === userId);
    
    if (existingLike) {
      // Unlike
      db.likes = db.likes.filter(l => l.id !== existingLike.id);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      // Like
      const newLike = {
        id: Date.now().toString(),
        postId,
        userId,
        createdAt: new Date().toISOString()
      };
      db.likes.push(newLike);
      post.likesCount++;
    }
    
    await writeDB(db);
    
    res.json({
      success: true,
      isLiked: !existingLike,
      likesCount: post.likesCount
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Delete post
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const postIndex = db.posts.findIndex(p => p.id === req.params.id);
    
    if (postIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }
    
    const post = db.posts[postIndex];
    
    // Check if user is the author
    if (post.authorId !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own posts' 
      });
    }
    
    // Remove post and related data
    db.posts.splice(postIndex, 1);
    db.likes = db.likes.filter(l => l.postId !== req.params.id);
    db.comments = db.comments.filter(c => c.postId !== req.params.id);
    
    await writeDB(db);
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Helper function to calculate time ago
function getTimeAgo(dateString) {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
}

// Verify token endpoint
app.get('/api/verify', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const user = db.users.find(u => u.id === req.user.userId);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType: user.accountType,
        university: user.university,
        graduationYear: user.graduationYear,
        profilePicture: user.profilePicture || null
      }
    });

  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

// Initialize database and start server
initializeDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});