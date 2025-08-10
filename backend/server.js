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
      likes: [],
      commentLikes: [],
      follows: [],
      notifications: []
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
    
    return db;
  } catch (error) {
    return { users: [], posts: [], comments: [], likes: [], commentLikes: [], follows: [], notifications: [] };
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
initializeDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});