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
app.use(express.json({ limit: '10mb' })); // Increased limit for image uploads
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
      likes: [],
      commentLikes: [],
      follows: [],
      notifications: [],
      communities: [],
      communityMembers: [],
      questions: [],
      answers: [],
      helpfulMarks: [],
      fundraisers: [],
      investments: []
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
    if (!db.commentLikes) db.commentLikes = [];
    if (!db.follows) db.follows = [];
    if (!db.notifications) db.notifications = [];
    if (!db.communities) db.communities = [];
    if (!db.communityMembers) db.communityMembers = [];
    if (!db.questions) db.questions = [];
    if (!db.answers) db.answers = [];
    if (!db.helpfulMarks) db.helpfulMarks = [];
    if (!db.fundraisers) db.fundraisers = [];
    if (!db.investments) db.investments = [];
    
    return db;
  } catch (error) {
    return { users: [], posts: [], comments: [], likes: [], commentLikes: [], follows: [], notifications: [], communities: [], communityMembers: [], questions: [], answers: [], helpfulMarks: [], fundraisers: [], investments: [] };
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
  // For alumni and prospective students, any valid email format
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Generate unique referral code with account type prefix
function generateReferralCode(accountType) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) { // Reduced to 6 chars to make room for prefix
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Add prefix based on account type
  const prefix = accountType === 'student' ? '-s' : '-a';
  return result + prefix;
}

// Extract account type from referral code prefix
function getAccountTypeFromReferralCode(referralCode) {
  if (referralCode.endsWith('-s')) return 'student';
  if (referralCode.endsWith('-a')) return 'alumni';
  return null; // For legacy codes without prefix
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
      // Credit system fields
      creditPoints: accountType === 'student' ? 10 : 0, // Students get 10 free credits
      freeInterviews: accountType === 'student' ? 1 : 0, // Students get 1 free interview
      referralCode: generateReferralCode(accountType),
      referredBy: null,
      referralCount: 0,
      // Subscription (students only)
      subscription: accountType === 'student' ? {
        plan: 'basic',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: null
      } : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Set isApproved to false for alumni, true for others
      ...(accountType === 'alumni' && { isApproved: false })
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
        profilePicture: newUser.profilePicture,
        isApproved: newUser.accountType === 'alumni' ? newUser.isApproved : true
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

// Prospective Student Registration endpoint
app.post('/api/auth/register-prospective', async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      currentSchool,
      interestedProgram
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !currentSchool || !interestedProgram) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address'
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

    // Create new prospective student user
    const newUser = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType: 'prospective',
      currentSchool,
      interestedProgram,
      profilePicture: null,
      bio: '',
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
      message: 'Prospective student registered successfully',
      token,
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        accountType: newUser.accountType,
        currentSchool: newUser.currentSchool,
        interestedProgram: newUser.interestedProgram,
        profilePicture: newUser.profilePicture
      }
    });

  } catch (error) {
    console.error('Prospective student registration error:', error);
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

    // Initialize isApproved field for alumni if it doesn't exist
    if (user.accountType === 'alumni' && user.isApproved === undefined) {
      user.isApproved = false;
      // Update the user in the database
      const userIndex = db.users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        db.users[userIndex] = user;
        await writeDB(db);
      }
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
        university: user.university || '',
        graduationYear: user.graduationYear || '',
        currentSchool: user.currentSchool || '',
        interestedProgram: user.interestedProgram || '',
        profilePicture: user.profilePicture || null,
        isApproved: user.accountType === 'alumni' ? user.isApproved : true,
        creditPoints: user.creditPoints || 0,
        freeInterviews: user.freeInterviews || 0,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referralCount: user.referralCount || 0
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

// Get any user's profile by ID
app.get('/api/user/:userId/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const db = await readDB();
    
    const user = db.users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return public profile information (excluding password)
    const { password, ...publicProfile } = user;
    
    res.json({
      success: true,
      user: publicProfile
    });
    
  } catch (error) {
    console.error('Get user profile error:', error);
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

// Update banner image
app.post('/api/profile/banner', authenticateToken, async (req, res) => {
  try {
    const { bannerImage } = req.body;

    if (!bannerImage) {
      return res.status(400).json({ 
        success: false, 
        message: 'Banner image data is required' 
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

    // Update banner image
    db.users[userIndex].bannerImage = bannerImage;
    db.users[userIndex].updatedAt = new Date().toISOString();

    await writeDB(db);

    res.json({
      success: true,
      message: 'Banner image updated successfully',
      bannerImage: bannerImage
    });
  } catch (error) {
    console.error('Update banner image error:', error);
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
    const { title, content, excerpt, tags, category, targetAudience, communityId, image } = req.body;
    
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
      communityId: communityId || null,
      image: image || null,
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

// Get comments for a post
app.get('/api/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const postId = req.params.id;
    
    // Get all comments for this post
    const comments = db.comments
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first for threading
    
    // Create a map to organize comments by parent
    const commentMap = new Map();
    const rootComments = [];
    
    // First pass: create comment objects with author info
    const enrichedComments = comments.map(comment => {
      const author = db.users.find(user => user.id === comment.authorId);
      
      // Check if current user liked this comment
      const isLiked = db.commentLikes && db.commentLikes.some(like => 
        like.commentId === comment.id && like.userId === req.user.userId
      );
      
      return {
        ...comment,
        author: {
          id: author.id,
          firstName: author.firstName,
          lastName: author.lastName,
          accountType: author.accountType,
          university: author.university,
          profilePicture: author.profilePicture || null
        },
        timeAgo: getTimeAgo(comment.createdAt),
        isLiked: isLiked || false,
        replies: []
      };
    });
    
    // Second pass: organize into threads
    enrichedComments.forEach(comment => {
      commentMap.set(comment.id, comment);
      
      if (comment.parentId) {
        // This is a reply
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        // This is a root comment
        rootComments.push(comment);
      }
    });
    
    res.json({
      success: true,
      comments: rootComments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Add comment to a post
app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const postId = req.params.id;
    const { content, parentId } = req.body;
    
    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment content is required' 
      });
    }
    
    if (content.length > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment is too long (max 1000 characters)' 
      });
    }
    
    // Check if post exists
    const post = db.posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }
    
    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = db.comments.find(c => c.id === parentId && c.postId === postId);
      if (!parentComment) {
        return res.status(404).json({ 
          success: false, 
          message: 'Parent comment not found' 
        });
      }
    }
    
    // Create new comment
    const comment = {
      id: Date.now().toString(),
      postId,
      authorId: req.user.userId,
      content: content.trim(),
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 0
    };
    
    // Add comment to database
    db.comments.push(comment);
    
    // Update post's comment count
    const postIndex = db.posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      db.posts[postIndex].commentsCount += 1;
    }
    
    await writeDB(db);
    
    // Get author info for response
    const author = db.users.find(user => user.id === req.user.userId);
    const commentWithAuthor = {
      ...comment,
      author: {
        id: author.id,
        firstName: author.firstName,
        lastName: author.lastName,
        accountType: author.accountType,
        university: author.university,
        profilePicture: author.profilePicture || null
      },
      timeAgo: getTimeAgo(comment.createdAt),
      replies: []
    };
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: commentWithAuthor
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Delete comment
app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const commentId = req.params.id;
    
    // Find the comment
    const comment = db.comments.find(c => c.id === commentId);
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }
    
    // Check if user owns the comment or the post
    const post = db.posts.find(p => p.id === comment.postId);
    if (comment.authorId !== req.user.userId && post.authorId !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this comment' 
      });
    }
    
    // Remove comment and all its replies
    function deleteCommentAndReplies(commentId) {
      const replies = db.comments.filter(c => c.parentId === commentId);
      replies.forEach(reply => deleteCommentAndReplies(reply.id));
      db.comments = db.comments.filter(c => c.id !== commentId);
    }
    
    const deletedCount = db.comments.filter(c => c.id === commentId || isReplyToComment(c, commentId, db.comments)).length;
    deleteCommentAndReplies(commentId);
    
    // Update post's comment count
    const postIndex = db.posts.findIndex(p => p.id === comment.postId);
    if (postIndex !== -1) {
      db.posts[postIndex].commentsCount = Math.max(0, db.posts[postIndex].commentsCount - deletedCount);
    }
    
    await writeDB(db);
    
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Like/unlike a comment
app.post('/api/comments/:id/like', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const commentId = req.params.id;
    const userId = req.user.userId;
    
    // Check if comment exists
    const comment = db.comments.find(c => c.id === commentId);
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }
    
    // Initialize commentLikes array if it doesn't exist
    if (!db.commentLikes) {
      db.commentLikes = [];
    }
    
    // Check if user already liked this comment
    const existingLike = db.commentLikes.find(like => 
      like.commentId === commentId && like.userId === userId
    );
    
    let isLiked;
    let likesCount;
    
    if (existingLike) {
      // Unlike: remove the like
      db.commentLikes = db.commentLikes.filter(like => 
        !(like.commentId === commentId && like.userId === userId)
      );
      
      // Update comment's like count
      const commentIndex = db.comments.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        db.comments[commentIndex].likesCount = Math.max(0, db.comments[commentIndex].likesCount - 1);
        likesCount = db.comments[commentIndex].likesCount;
      }
      
      isLiked = false;
    } else {
      // Like: add the like
      const newLike = {
        id: Date.now().toString(),
        commentId,
        userId,
        createdAt: new Date().toISOString()
      };
      
      db.commentLikes.push(newLike);
      
      // Update comment's like count
      const commentIndex = db.comments.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        db.comments[commentIndex].likesCount += 1;
        likesCount = db.comments[commentIndex].likesCount;
      }
      
      isLiked = true;
    }
    
    await writeDB(db);
    
    res.json({
      success: true,
      isLiked,
      likesCount,
      message: isLiked ? 'Comment liked' : 'Comment unliked'
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Helper function to check if a comment is a reply to another comment (recursively)
function isReplyToComment(comment, targetCommentId, allComments) {
  if (comment.parentId === targetCommentId) {
    return true;
  }
  if (comment.parentId) {
    const parent = allComments.find(c => c.id === comment.parentId);
    if (parent) {
      return isReplyToComment(parent, targetCommentId, allComments);
    }
  }
  return false;
}

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
        profilePicture: user.profilePicture || null,
        isApproved: user.accountType === 'alumni' ? user.isApproved : true,
        creditPoints: user.creditPoints || 0,
        freeInterviews: user.freeInterviews || 0,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referralCount: user.referralCount || 0
      }
    });

  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

// ================= FOLLOW ENDPOINTS =================

// Follow a user
// Helper function to create a notification
async function createNotification(type, actorId, recipientId, data = {}) {
  const db = await readDB();
  
  const notification = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type,
    actorId,
    recipientId,
    data,
    read: false,
    createdAt: new Date().toISOString()
  };
  
  db.notifications.push(notification);
  await writeDB(db);
  
  return notification;
}

app.post('/api/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;

    // Check if user is trying to follow themselves
    if (followerId === followingId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const db = await readDB();

    // Check if user to follow exists
    const userToFollow = db.users.find(u => u.id === followingId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    const existingFollow = db.follows.find(f => 
      f.followerId === followerId && f.followingId === followingId
    );

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }

    // Create follow relationship
    const follow = {
      id: Date.now().toString(),
      followerId,
      followingId,
      createdAt: new Date().toISOString()
    };

    db.follows.push(follow);
    await writeDB(db);

    // Create notification for the followed user
    await createNotification('follow', followerId, followingId, {
      followId: follow.id
    });

    res.json({
      success: true,
      message: 'User followed successfully',
      follow
    });

  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Unfollow a user
app.delete('/api/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;

    const db = await readDB();

    // Find and remove follow relationship
    const followIndex = db.follows.findIndex(f => 
      f.followerId === followerId && f.followingId === followingId
    );

    if (followIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Not following this user'
      });
    }

    const follow = db.follows[followIndex];
    db.follows.splice(followIndex, 1);
    
    // Remove the follow notification
    const notificationIndex = db.notifications.findIndex(n => 
      n.type === 'follow' && 
      n.actorId === followerId && 
      n.recipientId === followingId &&
      n.data?.followId === follow.id
    );
    
    if (notificationIndex !== -1) {
      db.notifications.splice(notificationIndex, 1);
    }
    
    await writeDB(db);

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });

  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get user's followers
app.get('/api/user/:userId/followers', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const db = await readDB();

    // Get all followers for this user
    const followerIds = db.follows
      .filter(f => f.followingId === userId)
      .map(f => f.followerId);

    // Get follower details
    const followers = db.users
      .filter(u => followerIds.includes(u.id))
      .map(u => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        profilePicture: u.profilePicture,
        accountType: u.accountType,
        university: u.university
      }));

    res.json({
      success: true,
      followers,
      count: followers.length
    });

  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get user's following
app.get('/api/user/:userId/following', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const db = await readDB();

    // Get all users this user is following
    const followingIds = db.follows
      .filter(f => f.followerId === userId)
      .map(f => f.followingId);

    // Get following details
    const following = db.users
      .filter(u => followingIds.includes(u.id))
      .map(u => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        profilePicture: u.profilePicture,
        accountType: u.accountType,
        university: u.university
      }));

    res.json({
      success: true,
      following,
      count: following.length
    });

  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Check if user is following another user
app.get('/api/follow/status/:userId', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;
    const db = await readDB();

    const isFollowing = db.follows.some(f => 
      f.followerId === followerId && f.followingId === followingId
    );

    res.json({
      success: true,
      isFollowing
    });

  } catch (error) {
    console.error('Follow status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get follow counts for a user
app.get('/api/user/:userId/follow-counts', async (req, res) => {
  try {
    const userId = req.params.userId;
    const db = await readDB();

    const followersCount = db.follows.filter(f => f.followingId === userId).length;
    const followingCount = db.follows.filter(f => f.followerId === userId).length;

    res.json({
      success: true,
      followersCount,
      followingCount
    });

  } catch (error) {
    console.error('Follow counts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Notifications endpoints
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const userId = req.user.id;
    
    // Get notifications for the current user
    const notifications = db.notifications
      .filter(notification => notification.recipientId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Populate actor information
    const populatedNotifications = notifications.map(notification => {
      const actor = db.users.find(user => user.id === notification.actorId);
      return {
        ...notification,
        actor: actor ? {
          id: actor.id,
          name: actor.name,
          profilePicture: actor.profilePicture
        } : null
      };
    });
    
    res.json({
      success: true,
      notifications: populatedNotifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

app.patch('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    const notification = db.notifications.find(n => 
      n.id === notificationId && n.recipientId === userId
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    notification.read = true;
    notification.readAt = new Date().toISOString();
    
    await writeDB(db);
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

app.patch('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const userId = req.user.id;
    
    // Mark all unread notifications as read
    const userNotifications = db.notifications.filter(n => 
      n.recipientId === userId && !n.read
    );
    
    userNotifications.forEach(notification => {
      notification.read = true;
      notification.readAt = new Date().toISOString();
    });
    
    await writeDB(db);
    
    res.json({
      success: true,
      message: 'All notifications marked as read',
      markedCount: userNotifications.length
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// Initialize database and start server
initializeDB().then(async () => {
  // Create default communities if none exist
  const db = await readDB();
  if (db.communities.length === 0) {
    const defaultCommunities = [
      {
        id: Date.now().toString() + '1',
        name: 'React',
        displayName: 'React Development',
        description: 'Everything about React, hooks, components, and modern frontend development',
        memberCount: 0,
        postCount: 0,
        icon: 'R',
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now().toString() + '2',
        name: 'Cybersecurity',
        displayName: 'Cybersecurity & InfoSec',
        description: 'Security practices, ethical hacking, penetration testing, and cybersecurity careers',
        memberCount: 0,
        postCount: 0,
        icon: '🔒',
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now().toString() + '3',
        name: 'WebDev',
        displayName: 'Web Development',
        description: 'Full-stack development, frameworks, best practices, and web technologies',
        memberCount: 0,
        postCount: 0,
        icon: 'W',
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now().toString() + '4',
        name: 'DataScience',
        displayName: 'Data Science & ML',
        description: 'Machine learning, data analysis, AI, and data visualization',
        memberCount: 0,
        postCount: 0,
        icon: '📊',
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now().toString() + '5',
        name: 'DevOps',
        displayName: 'DevOps & Cloud',
        description: 'CI/CD, cloud platforms, containerization, and infrastructure automation',
        memberCount: 0,
        postCount: 0,
        icon: '⚙️',
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now().toString() + '6',
        name: 'Mobile',
        displayName: 'Mobile Development',
        description: 'iOS, Android, React Native, Flutter, and mobile app development',
        memberCount: 0,
        postCount: 0,
        icon: '📱',
        createdAt: new Date().toISOString()
      }
    ];
    
    db.communities = defaultCommunities;
    await writeDB(db);
    console.log('Created default communities');
  }

  // Prospective Questions Q&A Endpoints

  // Get all questions
  app.get('/api/prospective/questions', async (req, res) => {
    try {
      const db = await readDB();
      
      if (!db.questions) db.questions = [];
      if (!db.answers) db.answers = [];
      
      const questions = db.questions.map(question => {
        const askedBy = db.users.find(u => u.id === question.askedById);
        const questionAnswers = db.answers
          .filter(answer => answer.questionId === question.id)
          .map(answer => {
            const answeredBy = db.users.find(u => u.id === answer.answeredById);
            return {
              ...answer,
              answeredBy: answeredBy ? {
                id: answeredBy.id,
                firstName: answeredBy.firstName,
                lastName: answeredBy.lastName,
                accountType: answeredBy.accountType,
                university: answeredBy.university,
                graduationYear: answeredBy.graduationYear
              } : null
            };
          })
          .filter(answer => answer.answeredBy);
        
        return {
          ...question,
          askedBy: askedBy ? {
            id: askedBy.id,
            firstName: askedBy.firstName,
            lastName: askedBy.lastName,
            accountType: askedBy.accountType,
            currentSchool: askedBy.currentSchool
          } : null,
          answers: questionAnswers
        };
      })
      .filter(question => question.askedBy)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      res.json({
        success: true,
        questions
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch questions' });
    }
  });

  // Ask a question
  app.post('/api/prospective/questions', authenticateToken, async (req, res) => {
    try {
      const { title, content, category } = req.body;
      const userId = req.user.userId;
      
      if (!title || !content || !category) {
        return res.status(400).json({ 
          success: false, 
          message: 'Title, content, and category are required' 
        });
      }
      
      const db = await readDB();
      if (!db.questions) db.questions = [];
      
      const newQuestion = {
        id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        content,
        category,
        askedById: userId,
        createdAt: new Date().toISOString(),
        isResolved: false
      };
      
      db.questions.push(newQuestion);
      await writeDB(db);
      
      console.log('Looking for user with ID:', userId);
      console.log('Total users in DB:', db.users.length);
      
      // Get the question with user info for response
      const askedBy = db.users.find(u => u.id === userId);
      console.log('Found user:', askedBy);
      
      if (!askedBy) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      const questionWithUser = {
        ...newQuestion,
        askedBy: {
          id: askedBy.id,
          firstName: askedBy.firstName,
          lastName: askedBy.lastName,
          accountType: askedBy.accountType,
          currentSchool: askedBy.currentSchool || null
        },
        answers: []
      };
      
      res.status(201).json({
        success: true,
        message: 'Question posted successfully',
        question: questionWithUser
      });
    } catch (error) {
      console.error('Error posting question:', error);
      res.status(500).json({ success: false, message: 'Failed to post question' });
    }
  });

  // Answer a question
  app.post('/api/prospective/questions/:questionId/answers', authenticateToken, async (req, res) => {
    try {
      const { questionId } = req.params;
      const { content } = req.body;
      const userId = req.user.userId;
      
      if (!content) {
        return res.status(400).json({ 
          success: false, 
          message: 'Answer content is required' 
        });
      }
      
      const db = await readDB();
      if (!db.questions) db.questions = [];
      if (!db.answers) db.answers = [];
      
      const question = db.questions.find(q => q.id === questionId);
      if (!question) {
        return res.status(404).json({ 
          success: false, 
          message: 'Question not found' 
        });
      }
      
      // Only students and alumni can answer
      const user = db.users.find(u => u.id === userId);
      if (!user || (user.accountType !== 'student' && user.accountType !== 'alumni')) {
        return res.status(403).json({ 
          success: false, 
          message: 'Only students and alumni can answer questions' 
        });
      }
      
      const newAnswer = {
        id: `answer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        questionId,
        content,
        answeredById: userId,
        createdAt: new Date().toISOString(),
        isHelpful: false,
        helpfulCount: 0
      };
      
      db.answers.push(newAnswer);
      await writeDB(db);
      
      // Get the answer with user info for response
      const answerWithUser = {
        ...newAnswer,
        answeredBy: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          accountType: user.accountType,
          university: user.university,
          graduationYear: user.graduationYear
        }
      };
      
      res.status(201).json({
        success: true,
        message: 'Answer posted successfully',
        answer: answerWithUser
      });
    } catch (error) {
      console.error('Error posting answer:', error);
      res.status(500).json({ success: false, message: 'Failed to post answer' });
    }
  });

  // Mark answer as helpful
  app.post('/api/prospective/answers/:answerId/helpful', authenticateToken, async (req, res) => {
    try {
      const { answerId } = req.params;
      const userId = req.user.id;
      
      const db = await readDB();
      if (!db.answers) db.answers = [];
      if (!db.helpfulMarks) db.helpfulMarks = [];
      
      const answer = db.answers.find(a => a.id === answerId);
      if (!answer) {
        return res.status(404).json({ 
          success: false, 
          message: 'Answer not found' 
        });
      }
      
      const existingMark = db.helpfulMarks.find(m => 
        m.answerId === answerId && m.userId === userId
      );
      
      if (existingMark) {
        return res.status(400).json({ 
          success: false, 
          message: 'Already marked as helpful' 
        });
      }
      
      db.helpfulMarks.push({
        id: `helpful_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        answerId,
        userId,
        createdAt: new Date().toISOString()
      });
      
      answer.helpfulCount = (answer.helpfulCount || 0) + 1;
      await writeDB(db);
      
      res.json({
        success: true,
        message: 'Answer marked as helpful',
        helpfulCount: answer.helpfulCount
      });
    } catch (error) {
      console.error('Error marking answer as helpful:', error);
      res.status(500).json({ success: false, message: 'Failed to mark answer as helpful' });
    }
  });

  // Admin endpoints
  // Get pending alumni for approval
  app.get('/api/admin/pending-alumni', async (req, res) => {
    try {
      const db = await readDB();
      
      // Get all alumni users and add isApproved field if it doesn't exist
      const alumniUsers = db.users
        .filter(user => user.accountType === 'alumni')
        .map(user => {
          // If isApproved field doesn't exist, set it to false (pending)
          if (user.isApproved === undefined) {
            user.isApproved = false;
          }
          return user;
        });
      
      // Save updated users back to database
      await writeDB(db);
      
      // Return only pending alumni (isApproved: false)
      const pendingAlumni = alumniUsers.filter(user => !user.isApproved);
      
      res.json({
        success: true,
        pendingAlumni: pendingAlumni.map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          university: user.university,
          graduationYear: user.graduationYear,
          createdAt: user.createdAt,
          proofDocument: user.proofDocument || null
        }))
      });
    } catch (error) {
      console.error('Error fetching pending alumni:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch pending alumni' });
    }
  });

  // Approve alumni
  app.post('/api/admin/approve-alumni/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const db = await readDB();
      
      const userIndex = db.users.findIndex(user => user.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const user = db.users[userIndex];
      if (user.accountType !== 'alumni') {
        return res.status(400).json({ success: false, message: 'User is not an alumni' });
      }
      
      // Approve the user
      db.users[userIndex].isApproved = true;
      db.users[userIndex].updatedAt = new Date().toISOString();
      
      await writeDB(db);
      
      res.json({
        success: true,
        message: 'Alumni approved successfully',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          isApproved: true
        }
      });
    } catch (error) {
      console.error('Error approving alumni:', error);
      res.status(500).json({ success: false, message: 'Failed to approve alumni' });
    }
  });

  // Reject alumni
  app.post('/api/admin/reject-alumni/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      const db = await readDB();
      
      const userIndex = db.users.findIndex(user => user.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const user = db.users[userIndex];
      if (user.accountType !== 'alumni') {
        return res.status(400).json({ success: false, message: 'User is not an alumni' });
      }
      
      // Mark as rejected (you could delete or keep with rejected status)
      db.users[userIndex].isApproved = false;
      db.users[userIndex].rejectionReason = reason || 'No reason provided';
      db.users[userIndex].updatedAt = new Date().toISOString();
      
      await writeDB(db);
      
      res.json({
        success: true,
        message: 'Alumni rejected successfully'
      });
    } catch (error) {
      console.error('Error rejecting alumni:', error);
      res.status(500).json({ success: false, message: 'Failed to reject alumni' });
    }
  });

  // Get admin statistics
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const db = await readDB();
      
      const totalUsers = db.users.length;
      const totalStudents = db.users.filter(user => user.accountType === 'student').length;
      const totalAlumni = db.users.filter(user => user.accountType === 'alumni').length;
      const pendingAlumni = db.users.filter(user => user.accountType === 'alumni' && !user.isApproved).length;
      const approvedAlumni = db.users.filter(user => user.accountType === 'alumni' && user.isApproved).length;
      const totalPosts = db.posts.length;
      const totalCommunities = db.communities.length;
      
      res.json({
        success: true,
        stats: {
          totalUsers,
          totalStudents,
          totalAlumni,
          pendingAlumni,
          approvedAlumni,
          totalPosts,
          totalCommunities
        }
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch admin statistics' });
    }
  });

  // Get all users data for admin dashboard
  app.get('/api/admin/all-users', async (req, res) => {
    try {
      const db = await readDB();
      
      res.json({
        success: true,
        users: db.users,
        posts: db.posts || [],
        communities: db.communities || []
      });
    } catch (error) {
      console.error('Error fetching all users data:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch all users data' });
    }
  });

  // =================== FUNDRAISER ENDPOINTS ===================

  // Get all fundraisers
  app.get('/api/fundraisers', authenticateToken, async (req, res) => {
    try {
      const db = await readDB();
      const { status, category } = req.query;
      
      let fundraisers = db.fundraisers || [];
      
      // Filter by status if provided
      if (status && status !== 'all') {
        fundraisers = fundraisers.filter(f => f.status === status);
      }
      
      // Filter by category if provided
      if (category && category !== 'all') {
        fundraisers = fundraisers.filter(f => f.category === category);
      }
      
      // Add calculated fields
      const fundraisersWithDetails = fundraisers.map(fundraiser => {
        const investments = db.investments?.filter(inv => inv.fundraiserId === fundraiser.id) || [];
        const investorsCount = new Set(investments.map(inv => inv.investorEmail)).size;
        const raisedAmount = investments.reduce((sum, inv) => sum + inv.amount, 0);
        
        return {
          ...fundraiser,
          investorsCount,
          raisedAmount: Math.min(raisedAmount, fundraiser.targetAmount) // Cap at target
        };
      });
      
      res.json({
        success: true,
        fundraisers: fundraisersWithDetails
      });
    } catch (error) {
      console.error('Error fetching fundraisers:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch fundraisers' });
    }
  });

  // Create new fundraiser (students only)
  app.post('/api/fundraisers', authenticateToken, async (req, res) => {
    try {
      const db = await readDB();
      const user = db.users.find(u => u.id === req.user.userId);
      
      if (!user || user.accountType !== 'student') {
        return res.status(403).json({ success: false, message: 'Only students can create fundraisers' });
      }

      const {
        title,
        description,
        category,
        targetAmount,
        fundingGoal,
        businessModel,
        marketSize,
        competition,
        teamSize,
        timeline,
        riskAssessment,
        tags,
        pitchDeck,
        businessPlan,
        financialProjections
      } = req.body;

      const fundraiser = {
        id: Date.now().toString(),
        title,
        description,
        studentName: `${user.firstName} ${user.lastName}`,
        studentEmail: user.email,
        category,
        targetAmount: parseFloat(targetAmount),
        raisedAmount: 0,
        fundingGoal,
        businessModel,
        marketSize,
        competition,
        teamSize: parseInt(teamSize),
        timeline,
        riskAssessment,
        investorsCount: 0,
        createdAt: new Date().toISOString(),
        status: 'active',
        tags: tags || [],
        pitchDeck,
        businessPlan,
        financialProjections
      };

      db.fundraisers = db.fundraisers || [];
      db.fundraisers.push(fundraiser);
      
      await writeDB(db);

      res.json({
        success: true,
        message: 'Fundraiser created successfully',
        fundraiser
      });
    } catch (error) {
      console.error('Error creating fundraiser:', error);
      res.status(500).json({ success: false, message: 'Failed to create fundraiser' });
    }
  });

  // Get single fundraiser
  app.get('/api/fundraisers/:id', authenticateToken, async (req, res) => {
    try {
      const db = await readDB();
      const fundraiser = db.fundraisers?.find(f => f.id === req.params.id);
      
      if (!fundraiser) {
        return res.status(404).json({ success: false, message: 'Fundraiser not found' });
      }

      // Add investment details
      const investments = db.investments?.filter(inv => inv.fundraiserId === fundraiser.id) || [];
      const investorsCount = new Set(investments.map(inv => inv.investorEmail)).size;
      const raisedAmount = investments.reduce((sum, inv) => sum + inv.amount, 0);

      res.json({
        success: true,
        fundraiser: {
          ...fundraiser,
          investorsCount,
          raisedAmount: Math.min(raisedAmount, fundraiser.targetAmount),
          investments
        }
      });
    } catch (error) {
      console.error('Error fetching fundraiser:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch fundraiser' });
    }
  });

  // Create investment (alumni only)
  app.post('/api/fundraisers/:id/invest', authenticateToken, async (req, res) => {
    try {
      const db = await readDB();
      const user = db.users.find(u => u.id === req.user.userId);
      
      if (!user || user.accountType !== 'alumni') {
        return res.status(403).json({ success: false, message: 'Only alumni can invest in fundraisers' });
      }

      const fundraiser = db.fundraisers?.find(f => f.id === req.params.id);
      if (!fundraiser) {
        return res.status(404).json({ success: false, message: 'Fundraiser not found' });
      }

      if (fundraiser.status !== 'active') {
        return res.status(400).json({ success: false, message: 'Cannot invest in inactive fundraiser' });
      }

      const { amount, message } = req.body;
      const investmentAmount = parseFloat(amount);

      if (investmentAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Investment amount must be positive' });
      }

      // Check if total would exceed target
      const currentInvestments = db.investments?.filter(inv => inv.fundraiserId === fundraiser.id) || [];
      const currentRaised = currentInvestments.reduce((sum, inv) => sum + inv.amount, 0);
      
      if (currentRaised + investmentAmount > fundraiser.targetAmount) {
        return res.status(400).json({ 
          success: false, 
          message: `Investment would exceed target. Maximum available: ₹${fundraiser.targetAmount - currentRaised}` 
        });
      }

      const investment = {
        id: Date.now().toString(),
        fundraiserId: fundraiser.id,
        investorName: `${user.firstName} ${user.lastName}`,
        investorEmail: user.email,
        amount: investmentAmount,
        message: message || '',
        createdAt: new Date().toISOString(),
        status: 'confirmed'
      };

      db.investments = db.investments || [];
      db.investments.push(investment);

      // Check if fundraiser is now fully funded
      const newTotalRaised = currentRaised + investmentAmount;
      if (newTotalRaised >= fundraiser.targetAmount) {
        fundraiser.status = 'completed';
      }

      await writeDB(db);

      res.json({
        success: true,
        message: 'Investment successful',
        investment
      });
    } catch (error) {
      console.error('Error creating investment:', error);
      res.status(500).json({ success: false, message: 'Failed to create investment' });
    }
  });

  // Get user's investments (alumni only)
  app.get('/api/my-investments', authenticateToken, async (req, res) => {
    try {
      const db = await readDB();
      const user = db.users.find(u => u.id === req.user.userId);
      
      if (!user || user.accountType !== 'alumni') {
        return res.status(403).json({ success: false, message: 'Only alumni can view investments' });
      }

      const investments = db.investments?.filter(inv => inv.investorEmail === user.email) || [];
      
      // Add fundraiser details to each investment
      const investmentsWithDetails = investments.map(investment => {
        const fundraiser = db.fundraisers?.find(f => f.id === investment.fundraiserId);
        return {
          ...investment,
          fundraiserTitle: fundraiser?.title || 'Unknown',
          fundraiserStatus: fundraiser?.status || 'unknown'
        };
      });

      res.json({
        success: true,
        investments: investmentsWithDetails
      });
    } catch (error) {
      console.error('Error fetching investments:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch investments' });
    }
  });

  // Get user's fundraisers (students only)
  app.get('/api/my-fundraisers', authenticateToken, async (req, res) => {
    try {
      const db = await readDB();
      const user = db.users.find(u => u.id === req.user.userId);
      
      if (!user || user.accountType !== 'student') {
        return res.status(403).json({ success: false, message: 'Only students can view their fundraisers' });
      }

      const fundraisers = db.fundraisers?.filter(f => f.studentEmail === user.email) || [];
      
      // Add investment details
      const fundraisersWithDetails = fundraisers.map(fundraiser => {
        const investments = db.investments?.filter(inv => inv.fundraiserId === fundraiser.id) || [];
        const investorsCount = new Set(investments.map(inv => inv.investorEmail)).size;
        const raisedAmount = investments.reduce((sum, inv) => sum + inv.amount, 0);
        
        return {
          ...fundraiser,
          investorsCount,
          raisedAmount: Math.min(raisedAmount, fundraiser.targetAmount),
          investments
        };
      });

      res.json({
        success: true,
        fundraisers: fundraisersWithDetails
      });
    } catch (error) {
      console.error('Error fetching user fundraisers:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch user fundraisers' });
    }
  });

  // Career Sessions APIs
  // Get all alumni for career sessions
  app.get('/api/users/alumni', async (req, res) => {
    try {
      const db = await readDB();
      const alumni = db.users.filter(user => user.accountType === 'alumni').map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company || '',
        jobTitle: user.jobTitle || '',
        skills: user.skills || [],
        university: user.university,
        graduationYear: user.graduationYear,
        location: user.location || '',
        profilePicture: user.profilePicture,
        rating: Math.random() * 5, // Mock rating for now
        totalInterviews: Math.floor(Math.random() * 50),
        totalCounselling: Math.floor(Math.random() * 30),
        totalQuestions: Math.floor(Math.random() * 100),
        responseRate: Math.floor(Math.random() * 40) + 60, // 60-100%
        avgResponseTime: ['2 hours', '4 hours', '1 day', '2 days'][Math.floor(Math.random() * 4)]
      }));
      
      res.json({ success: true, alumni });
    } catch (error) {
      console.error('Error fetching alumni:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch alumni' });
    }
  });

  // Interview Sessions APIs
  app.post('/api/career-sessions/interviews/book', authenticateToken, async (req, res) => {
    try {
      const { alumniId, date, time, topic, notes, duration } = req.body;
      const db = await readDB();
      
      const userIndex = db.users.findIndex(u => u.id === req.user.userId);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const user = db.users[userIndex];
      if (user.accountType !== 'student') {
        return res.status(403).json({ success: false, message: 'Only students can book interview sessions' });
      }
      
      const INTERVIEW_COST = 30;
      if (user.creditPoints < INTERVIEW_COST) {
        return res.status(400).json({ success: false, message: 'Insufficient credits' });
      }
      
      // Deduct credits
      user.creditPoints -= INTERVIEW_COST;
      
      // Create interview session
      const session = {
        id: Date.now().toString(),
        alumniId,
        studentId: user.id,
        date,
        time,
        duration: duration || 60,
        status: 'pending',
        topic,
        notes,
        createdAt: new Date().toISOString()
      };
      
      if (!db.interviewSessions) db.interviewSessions = [];
      db.interviewSessions.push(session);
      
      await writeDB(db);
      
      res.json({ success: true, session });
    } catch (error) {
      console.error('Error booking interview:', error);
      res.status(500).json({ success: false, message: 'Failed to book interview session' });
    }
  });

  app.get('/api/career-sessions/interviews/my-sessions', authenticateToken, async (req, res) => {
    try {
      const db = await readDB();
      const sessions = (db.interviewSessions || []).filter(session => session.studentId === req.user.userId);
      res.json({ success: true, sessions });
    } catch (error) {
      console.error('Error fetching interview sessions:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch interview sessions' });
    }
  });

  // Counselling Sessions APIs
  app.post('/api/career-sessions/counselling/book', authenticateToken, async (req, res) => {
    try {
      const { alumniId, date, time, sessionType, topic, notes, duration } = req.body;
      const db = await readDB();
      
      const userIndex = db.users.findIndex(u => u.id === req.user.userId);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const user = db.users[userIndex];
      if (user.accountType !== 'student') {
        return res.status(403).json({ success: false, message: 'Only students can book counselling sessions' });
      }
      
      const COUNSELLING_COST = 50;
      if (user.creditPoints < COUNSELLING_COST) {
        return res.status(400).json({ success: false, message: 'Insufficient credits' });
      }
      
      // Deduct credits
      user.creditPoints -= COUNSELLING_COST;
      
      // Create counselling session
      const session = {
        id: Date.now().toString(),
        alumniId,
        studentId: user.id,
        date,
        time,
        duration: duration || 60,
        status: 'pending',
        sessionType,
        topic,
        notes,
        createdAt: new Date().toISOString()
      };
      
      if (!db.counsellingSessions) db.counsellingSessions = [];
      db.counsellingSessions.push(session);
      
      await writeDB(db);
      
      res.json({ success: true, session });
    } catch (error) {
      console.error('Error booking counselling session:', error);
      res.status(500).json({ success: false, message: 'Failed to book counselling session' });
    }
  });

  app.get('/api/career-sessions/counselling/my-sessions', authenticateToken, async (req, res) => {
    try {
      const db = await readDB();
      const sessions = (db.counsellingSessions || []).filter(session => session.studentId === req.user.userId);
      res.json({ success: true, sessions });
    } catch (error) {
      console.error('Error fetching counselling sessions:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch counselling sessions' });
    }
  });

  // Questioning Sessions APIs
  app.post('/api/career-sessions/questions/ask', authenticateToken, async (req, res) => {
    try {
      const { alumniId, question, category, priority } = req.body;
      const db = await readDB();
      
      const userIndex = db.users.findIndex(u => u.id === req.user.userId);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const user = db.users[userIndex];
      if (user.accountType !== 'student') {
        return res.status(403).json({ success: false, message: 'Only students can ask questions' });
      }
      
      const QUESTION_COST = priority === 'high' ? 2 : 1;
      if (user.creditPoints < QUESTION_COST) {
        return res.status(400).json({ success: false, message: 'Insufficient credits' });
      }
      
      // Deduct credits
      user.creditPoints -= QUESTION_COST;
      
      // Create question
      const questionObj = {
        id: Date.now().toString(),
        alumniId,
        studentId: user.id,
        question,
        category,
        priority,
        status: 'pending',
        credits: QUESTION_COST,
        askedAt: new Date().toISOString()
      };
      
      if (!db.questions) db.questions = [];
      db.questions.push(questionObj);
      
      await writeDB(db);
      
      res.json({ success: true, question: questionObj });
    } catch (error) {
      console.error('Error asking question:', error);
      res.status(500).json({ success: false, message: 'Failed to ask question' });
    }
  });

  app.get('/api/career-sessions/questions/my-questions', authenticateToken, async (req, res) => {
    try {
      const db = await readDB();
      const questions = (db.questions || []).filter(question => question.studentId === req.user.userId);
      res.json({ success: true, questions });
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch questions' });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Communities endpoints
app.get('/api/communities', async (req, res) => {
  try {
    const db = await readDB();
    const communities = db.communities.sort((a, b) => b.memberCount - a.memberCount);
    
    res.json({
      success: true,
      communities
    });
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch communities' });
  }
});

app.get('/api/communities/joined', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const userId = req.user.id;
    
    const userMemberships = db.communityMembers.filter(m => m.userId === userId);
    const joinedCommunityIds = userMemberships.map(m => m.communityId);
    
    res.json({
      success: true,
      communities: joinedCommunityIds
    });
  } catch (error) {
    console.error('Error fetching joined communities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch joined communities' });
  }
});

app.get('/api/communities/:communityName', async (req, res) => {
  try {
    const db = await readDB();
    const { communityName } = req.params;
    
    const community = db.communities.find(c => c.name === communityName);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    
    res.json({
      success: true,
      community
    });
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch community' });
  }
});

app.get('/api/communities/:communityName/posts', async (req, res) => {
  try {
    const db = await readDB();
    const { communityName } = req.params;
    
    const community = db.communities.find(c => c.name === communityName);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    
    const communityPosts = db.posts
      .filter(post => post.communityId === community.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(post => {
        const author = db.users.find(u => u.id === post.authorId);
        const likesCount = db.likes.filter(like => like.postId === post.id).length;
        const commentsCount = db.comments.filter(comment => comment.postId === post.id).length;
        
        return {
          ...post,
          authorName: author ? `${author.firstName} ${author.lastName}` : 'Unknown',
          likesCount,
          commentsCount
        };
      });
    
    res.json({
      success: true,
      posts: communityPosts
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch community posts' });
  }
});

// Check community name availability
app.get('/api/communities/check-name/:name', async (req, res) => {
  try {
    const db = await readDB();
    const { name } = req.params;
    
    // Check if name format is valid
    if (!name.startsWith('g-') || name.length < 5 || name.length > 24) {
      return res.json({
        success: true,
        available: false,
        message: 'Community name must start with "g-" and be between 5-24 characters'
      });
    }
    
    // Check if name already exists
    const existingCommunity = db.communities.find(c => c.name === name);
    
    res.json({
      success: true,
      available: !existingCommunity,
      message: existingCommunity ? 'Community name already exists' : 'Community name is available'
    });
    
  } catch (error) {
    console.error('Error checking community name:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check community name availability' 
    });
  }
});

// Create a new community
app.post('/api/communities', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const userId = req.user.id;
    const { name, displayName, description, icon, category } = req.body;
    
    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Community name and description are required' 
      });
    }
    
    // Check if community name already exists
    const existingCommunity = db.communities.find(c => c.name === name);
    if (existingCommunity) {
      return res.status(409).json({ 
        success: false, 
        message: 'Community name already exists' 
      });
    }
    
    // Validate name format (should start with g- and be appropriate length)
    if (!name.startsWith('g-') || name.length < 5 || name.length > 24) {
      return res.status(400).json({ 
        success: false, 
        message: 'Community name must start with "g-" and be between 5-24 characters' 
      });
    }
    
    // Create new community
    const newCommunity = {
      id: `community_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      displayName: displayName || name,
      description: description.trim(),
      icon: icon || '💬',
      category: category || 'general',
      creatorId: userId,
      memberCount: 1, // Creator is automatically a member
      postCount: 0,
      createdAt: new Date().toISOString(),
      isActive: true,
      communityType: 'public', // Default to public
      rules: [],
      settings: {
        allowImages: true,
        allowPolls: true,
        nsfw: false,
        moderationLevel: 'moderate'
      }
    };
    
    // Add community to database
    db.communities.push(newCommunity);
    
    // Automatically join the creator to the community
    const membership = {
      id: `membership_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      communityId: newCommunity.id,
      role: 'owner',
      joinedAt: new Date().toISOString()
    };
    
    db.communityMembers.push(membership);
    
    await writeDB(db);
    
    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      community: newCommunity
    });
    
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create community' 
    });
  }
});

app.post('/api/communities/:communityId/join', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const { communityId } = req.params;
    const userId = req.user.id;
    
    const community = db.communities.find(c => c.id === communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    
    const existingMembership = db.communityMembers.find(m => 
      m.userId === userId && m.communityId === communityId
    );
    
    if (existingMembership) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }
    
    db.communityMembers.push({
      id: Date.now().toString(),
      userId,
      communityId,
      joinedAt: new Date().toISOString()
    });
    
    community.memberCount += 1;
    await writeDB(db);
    
    res.json({ success: true, message: 'Joined community successfully' });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ success: false, message: 'Failed to join community' });
  }
});

app.post('/api/communities/:communityId/leave', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const { communityId } = req.params;
    const userId = req.user.id;
    
    const community = db.communities.find(c => c.id === communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    
    const membershipIndex = db.communityMembers.findIndex(m => 
      m.userId === userId && m.communityId === communityId
    );
    
    if (membershipIndex === -1) {
      return res.status(400).json({ success: false, message: 'Not a member' });
    }
    
    db.communityMembers.splice(membershipIndex, 1);
    community.memberCount = Math.max(0, community.memberCount - 1);
    await writeDB(db);
    
    res.json({ success: true, message: 'Left community successfully' });
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({ success: false, message: 'Failed to leave community' });
  }
});

app.get('/api/posts/trending', async (req, res) => {
  try {
    const db = await readDB();
    
    const trendingPosts = db.posts
      .map(post => {
        const author = db.users.find(u => u.id === post.authorId);
        const community = db.communities.find(c => c.id === post.communityId);
        const likesCount = db.likes.filter(like => like.postId === post.id).length;
        const commentsCount = db.comments.filter(comment => comment.postId === post.id).length;
        
        // Simple engagement score: likes + comments
        const trending_score = likesCount + commentsCount;
        
        return {
          ...post,
          authorName: author ? `${author.firstName} ${author.lastName}` : 'Unknown',
          communityName: community?.name,
          likesCount,
          commentsCount,
          trending_score
        };
      })
      .sort((a, b) => b.trending_score - a.trending_score); // Sort by engagement descending
    
    res.json({
      success: true,
      posts: trendingPosts
    });
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trending posts' });
  }
});

// Credit Management APIs
app.get('/api/credits', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const user = db.users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      creditPoints: user.creditPoints || 0,
      freeInterviews: user.freeInterviews || 0
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch credits' });
  }
});

app.post('/api/credits/deduct', authenticateToken, async (req, res) => {
  try {
    const { amount, type } = req.body; // type: 'interview' or 'general'
    const db = await readDB();
    const userIndex = db.users.findIndex(u => u.id === req.user.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = db.users[userIndex];
    
    if (type === 'interview') {
      // Check if user has free interviews first
      if (user.freeInterviews > 0) {
        user.freeInterviews -= 1;
      } else if (user.creditPoints >= 20) {
        user.creditPoints -= 20;
      } else {
        return res.status(400).json({ success: false, message: 'Insufficient credits for interview booking' });
      }
    } else {
      if (user.creditPoints < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient credits' });
      }
      user.creditPoints -= amount;
    }
    
    user.updatedAt = new Date().toISOString();
    await writeDB(db);
    
    res.json({
      success: true,
      creditPoints: user.creditPoints,
      freeInterviews: user.freeInterviews
    });
  } catch (error) {
    console.error('Error deducting credits:', error);
    res.status(500).json({ success: false, message: 'Failed to deduct credits' });
  }
});

app.post('/api/credits/add', authenticateToken, async (req, res) => {
  try {
    const { amount, freeInterviews } = req.body;
    const db = await readDB();
    const userIndex = db.users.findIndex(u => u.id === req.user.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = db.users[userIndex];
    user.creditPoints = (user.creditPoints || 0) + (amount || 0);
    user.freeInterviews = (user.freeInterviews || 0) + (freeInterviews || 0);
    user.updatedAt = new Date().toISOString();
    
    await writeDB(db);
    
    res.json({
      success: true,
      creditPoints: user.creditPoints,
      freeInterviews: user.freeInterviews
    });
  } catch (error) {
    console.error('Error adding credits:', error);
    res.status(500).json({ success: false, message: 'Failed to add credits' });
  }
});

// Referral System APIs
app.get('/api/referrals/validate-code/:code/:accountType', async (req, res) => {
  try {
    const { code, accountType } = req.params;
    const db = await readDB();
    
    // First check if the referral code prefix matches the account type
    const codeAccountType = getAccountTypeFromReferralCode(code);
    if (codeAccountType && codeAccountType !== accountType) {
      const codeTypeText = codeAccountType === 'student' ? 'students' : 'alumni';
      const userTypeText = accountType === 'student' ? 'Students' : 'Alumni';
      return res.status(400).json({ 
        success: false, 
        message: `This referral code is for ${codeTypeText}. ${userTypeText} can only use referral codes ending in ${accountType === 'student' ? '-s' : '-a'}.`
      });
    }
    
    // Find referring user by referral code
    const referringUser = db.users.find(u => u.referralCode === code);
    if (!referringUser) {
      return res.status(404).json({ success: false, message: 'Invalid referral code' });
    }
    
    // Double-check account types match (for legacy codes and additional safety)
    if (referringUser.accountType !== accountType) {
      return res.status(400).json({ 
        success: false, 
        message: `This referral code is from ${referringUser.accountType === 'student' ? 'a student' : 'an alumni'}. ${accountType === 'student' ? 'Students' : 'Alumni'} can only use referral codes from other ${accountType === 'student' ? 'students' : 'alumni'}.`
      });
    }
    
    res.json({
      success: true,
      message: 'Valid referral code',
      referringUser: {
        name: `${referringUser.firstName} ${referringUser.lastName}`,
        accountType: referringUser.accountType,
        university: referringUser.university
      }
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    res.status(500).json({ success: false, message: 'Failed to validate referral code' });
  }
});

app.post('/api/referrals/validate', async (req, res) => {
  try {
    const { referralCode, newUserId } = req.body;
    const db = await readDB();
    
    // Find referring user by referral code
    const referringUser = db.users.find(u => u.referralCode === referralCode);
    if (!referringUser) {
      return res.status(404).json({ success: false, message: 'Invalid referral code' });
    }
    
    // Find new user
    const newUserIndex = db.users.findIndex(u => u.id === newUserId);
    if (newUserIndex === -1) {
      return res.status(404).json({ success: false, message: 'New user not found' });
    }
    
    const newUser = db.users[newUserIndex];
    
    // Prevent self-referral
    if (referringUser.id === newUserId) {
      return res.status(400).json({ success: false, message: 'Cannot refer yourself' });
    }
    
    // Check if already referred
    if (newUser.referredBy) {
      return res.status(400).json({ success: false, message: 'User already referred by someone else' });
    }
    
    // Prevent cross-account-type referrals
    if (referringUser.accountType !== newUser.accountType) {
      return res.status(400).json({ 
        success: false, 
        message: `${referringUser.accountType === 'student' ? 'Students' : 'Alumni'} can only refer other ${referringUser.accountType === 'student' ? 'students' : 'alumni'}` 
      });
    }
    
    // Update new user with referral info
    newUser.referredBy = referringUser.id;
    
    // Update referring user's referral count and rewards
    const referringUserIndex = db.users.findIndex(u => u.id === referringUser.id);
    const referUser = db.users[referringUserIndex];
    referUser.referralCount = (referUser.referralCount || 0) + 1;
    
    // Reward logic
    if (referringUser.accountType === 'alumni' && newUser.accountType === 'alumni') {
      // Alumni referring alumni gets 50 credits
      referUser.creditPoints = (referUser.creditPoints || 0) + 50;
    } else if (referringUser.accountType === 'student' && newUser.accountType === 'student') {
      // Student referring student
      if (referUser.referralCount <= 3) {
        // First 3 referrals: 10 credits + 1 free interview
        referUser.creditPoints = (referUser.creditPoints || 0) + 10;
        referUser.freeInterviews = (referUser.freeInterviews || 0) + 1;
      } else {
        // After 3 referrals: only 5 credits
        referUser.creditPoints = (referUser.creditPoints || 0) + 5;
      }
    }
    
    referUser.updatedAt = new Date().toISOString();
    newUser.updatedAt = new Date().toISOString();
    
    await writeDB(db);
    
    res.json({
      success: true,
      message: 'Referral validated successfully',
      reward: {
        credits: referringUser.accountType === 'alumni' ? 50 : (referUser.referralCount <= 3 ? 10 : 5),
        freeInterviews: referringUser.accountType === 'student' && referUser.referralCount <= 3 ? 1 : 0
      }
    });
  } catch (error) {
    console.error('Error validating referral:', error);
    res.status(500).json({ success: false, message: 'Failed to validate referral' });
  }
});

app.get('/api/referrals/stats', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const user = db.users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const referralCount = db.users.filter(u => u.referredBy === user.id).length;
    
    res.json({
      success: true,
      referralCode: user.referralCode,
      referralCount,
      referralLink: `${req.protocol}://${req.get('host')}/register?ref=${user.referralCode}`
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch referral stats' });
  }
});

// Subscription Management APIs
app.get('/api/subscription', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    const user = db.users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      subscription: user.subscription || {
        plan: 'basic',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: null
      }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subscription' });
  }
});

app.post('/api/subscription/upgrade', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body; // 'basic', 'pro', 'pro+'
    const db = await readDB();
    const userIndex = db.users.findIndex(u => u.id === req.user.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = db.users[userIndex];
    
    if (user.accountType !== 'student') {
      return res.status(400).json({ success: false, message: 'Only students can have subscriptions' });
    }
    
    user.subscription = {
      plan,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: null
    };
    user.updatedAt = new Date().toISOString();
    
    await writeDB(db);
    
    res.json({
      success: true,
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to upgrade subscription' });
  }
});