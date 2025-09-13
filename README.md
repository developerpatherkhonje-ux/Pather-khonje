# Pather Khonje - Travel Management System

A comprehensive travel management platform built with React frontend and Node.js backend, designed to manage hotels, packages, bookings, and user interactions.

## 🏗️ Project Structure

```
pather-khonje-new/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API services
│   │   └── config/        # Configuration files
│   ├── package.json
│   └── vite.config.js
├── backend/           # Node.js/Express server
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── utils/         # Utility functions
│   └── config/        # Server configuration
└── SETUP.md          # Setup instructions
```

## 🚀 Features

### Frontend Features
- **Modern UI**: Built with React 18, Tailwind CSS, and Framer Motion
- **Authentication**: Complete login/signup system with protected routes
- **Dashboard**: Admin dashboard for managing hotels, packages, and bookings
- **Responsive Design**: Mobile-first approach with beautiful UI components
- **Real-time Updates**: Dynamic content loading and state management

### Backend Features
- **RESTful API**: Express.js server with comprehensive API endpoints
- **Authentication**: JWT-based authentication with refresh tokens
- **Security**: Password hashing, input validation, and audit logging
- **Database Models**: User, Hotel, Package, and Booking management
- **Admin Panel**: Administrative routes for system management

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Framer Motion** - Animation library
- **React Hook Form** - Form management
- **React Query** - Data fetching and caching

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **MongoDB** - Database (configured)
- **Winston** - Logging
- **Helmet** - Security middleware

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud)

### Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Configure your .env file with database and JWT secrets
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pather-khonje
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

### Backend Deployment (Railway/Heroku)
1. Connect your GitHub repository
2. Set start command: `npm start`
3. Add environment variables
4. Configure MongoDB connection

## 📱 Usage

1. **Start the backend server**: `cd backend && npm start`
2. **Start the frontend**: `cd frontend && npm run dev`
3. **Access the application**: http://localhost:5173
4. **API endpoints**: http://localhost:5000/api

## 🔐 Authentication

The system includes:
- User registration and login
- JWT token-based authentication
- Refresh token mechanism
- Protected routes
- Role-based access control

## 📊 Admin Features

- Hotel management
- Package management
- User management
- Booking management
- Analytics dashboard
- Payment voucher system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is private and proprietary to CodeFlare Labs.

## 📞 Support

For support and questions, please contact the development team.

---

**Built with ❤️ by CodeFlare Labs**
