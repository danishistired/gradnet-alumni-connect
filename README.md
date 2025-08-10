# GradNet Alumni Connect

A modern professional networking platform that bridges students and alumni. Share knowledge, find mentors, and accelerate your career journey.

## 🌟 Features

### Core Functionality
- **User Authentication & Authorization** - Secure registration and login system
- **Profile Management** - Comprehensive user profiles with skills, education, and experience
- **Alumni Verification** - Special verification system for alumni status
- **Real-time Feed** - Dynamic feed with posts, comments, and interactions
- **Following System** - Follow other users and see their updates
- **Notifications** - Real-time notifications for follows, likes, and comments
- **Messaging** - Direct messaging between users
- **Blog System** - Create and share blog posts with the community

### User Types
- **Students** - Current university students looking for guidance and opportunities
- **Alumni** - Graduated professionals willing to share knowledge and mentor
- **Admin** - Platform administrators with special privileges

### Advanced Features
- **Skill Selection** - Tag yourself with relevant skills and technologies
- **Company Integration** - Connect with companies and showcase work experience
- **Search & Discovery** - Find users by skills, company, graduation year, etc.
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **date-fns** - Date manipulation library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **JSON Database** - File-based database for simplicity
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting
- **Nodemon** - Auto-restart server during development
- **PostCSS** - CSS post-processing

## 📁 Project Structure

```
gradnet-alumni-connect/
├── src/                          # Frontend source code
│   ├── components/              # Reusable React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── Navbar.tsx          # Navigation component
│   │   ├── Logo.tsx            # Brand logo component
│   │   └── ...                 # Other components
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   ├── BlogContext.tsx     # Blog management
│   │   ├── FollowContext.tsx   # Follow system
│   │   ├── NotificationContext.tsx # Notifications
│   │   └── ProfileContext.tsx  # Profile management
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   ├── pages/                  # Page components
│   │   ├── Index.tsx           # Landing page
│   │   ├── Login.tsx           # Login page
│   │   ├── Register.tsx        # Registration page
│   │   ├── Feed.tsx            # Main feed
│   │   ├── Profile.tsx         # User profile
│   │   └── ...                 # Other pages
│   └── assets/                 # Static assets
├── backend/                    # Backend source code
│   ├── server.js              # Express server
│   ├── database.json          # JSON database
│   └── package.json           # Backend dependencies
├── public/                     # Public assets
├── package.json               # Frontend dependencies
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite configuration
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gradnet-alumni-connect
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Development

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server** (in a new terminal)
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

3. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

### Production Build

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Preview the production build**
   ```bash
   npm run preview
   ```

## 📊 Database Schema

The application uses a JSON file-based database with the following collections:

- **users** - User accounts and profiles
- **posts** - Blog posts and feed content
- **comments** - Comments on posts
- **likes** - Post and comment likes
- **commentLikes** - Specific comment likes
- **follows** - User following relationships
- **notifications** - System notifications

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Tokens are stored in localStorage
- Protected routes require valid authentication
- Different user types have different access levels

## 🎨 UI/UX Features

- **Dark/Light Theme** - Automatic theme switching
- **Responsive Design** - Mobile-first approach
- **Smooth Animations** - CSS transitions and transforms
- **Accessibility** - ARIA labels and keyboard navigation
- **Loading States** - Skeleton screens and spinners
- **Error Handling** - User-friendly error messages

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000
```

### Backend Configuration
The backend server configuration can be modified in `backend/server.js`:
- Port: Default 5000
- CORS settings
- JWT secret
- Database file path

## 🧪 Testing

Currently, the project focuses on manual testing. Future improvements may include:
- Unit tests with Jest
- Integration tests
- E2E tests with Playwright

## 📝 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Users
- `GET /api/user/:id` - Get user profile
- `PUT /api/user/:id` - Update user profile
- `GET /api/users` - Get all users (with filters)

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get specific post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Comments
- `GET /api/posts/:id/comments` - Get post comments
- `POST /api/posts/:id/comments` - Add comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Likes
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/comments/:id/like` - Like/unlike comment

### Follow System
- `POST /api/follow/:userId` - Follow user
- `DELETE /api/follow/:userId` - Unfollow user
- `GET /api/user/:userId/followers` - Get followers
- `GET /api/user/:userId/following` - Get following

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

If you have any questions or need help, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Contact the development team

## 🚀 Deployment

### Frontend
The frontend can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Backend
The backend can be deployed to:
- Heroku
- Railway
- DigitalOcean
- AWS EC2

Remember to update the API URL in your frontend environment variables when deploying.

---

**Built with ❤️ for the GradNet community**
