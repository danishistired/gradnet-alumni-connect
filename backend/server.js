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
    return JSON.parse(data);
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