# GradNet Authentication Setup

This guide will help you set up the complete authentication system for GradNet.

## 1. Install Backend Dependencies

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

## 2. Start the Backend Server

```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

## 3. Start the Frontend

In a new terminal, navigate back to the main project directory:

```bash
cd ..
npm run dev
```

The frontend will start on `http://localhost:8080`

## 4. How the Authentication Works

### Registration Process:
1. User fills out the registration form with:
   - First Name, Last Name
   - Email (must be @cuchd.in for students, any email for alumni)
   - Password (minimum 6 characters)
   - Account Type (Student or Alumni)
   - University and Graduation Year
   - Terms acceptance

2. Backend validates the data and:
   - Checks if email already exists
   - Validates email format based on account type
   - Hashes the password using bcrypt
   - Creates a new user record
   - Generates a JWT token
   - Returns user data and token

3. Frontend stores the token in localStorage and updates the user state

### Login Process:
1. User enters:
   - Email
   - Password
   - Account Type

2. Backend:
   - Validates email format
   - Finds user by email and account type
   - Compares password with hashed version
   - Generates JWT token if valid
   - Returns user data and token

3. Frontend stores token and updates user state

### Database:
- Uses a simple JSON file (`database.json`) for storing user data
- In production, this should be replaced with a proper database (MongoDB, PostgreSQL, etc.)

### Security Features:
- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Email validation based on account type
- Protected routes (coming soon)

## 5. Testing the System

1. **Register a new student:**
   - Use email ending with @cuchd.in
   - Fill out all required fields
   - Should redirect to home page when successful

2. **Register a new alumni:**
   - Use any valid email format
   - Fill out all required fields
   - Should redirect to home page when successful

3. **Login with existing credentials:**
   - Use the same email and password you registered with
   - Select the correct account type
   - Should log you in and show user avatar in navbar

4. **Test authentication:**
   - When logged in, you should see your avatar and dropdown menu
   - When logged out, you should see Login/Sign Up buttons
   - Refresh the page - should maintain login state

## 6. API Endpoints

- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `GET /api/verify` - Verify JWT token

## 7. Next Steps

Once authentication is working, you can add:
- Protected routes
- User profile pages
- Password reset functionality
- Email verification
- Role-based access control