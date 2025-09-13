# Pather Khonje Travel Agency

A full-stack travel agency application with React frontend and Node.js backend.

## 🚀 Live URLs

- **Frontend**: https://pather-khonje.vercel.app/
- **Backend API**: https://pather-khonje.onrender.com/api
- **API Documentation**: https://pather-khonje.onrender.com/api-docs

## 🏗️ Architecture

### Frontend (Vercel)
- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context
- **HTTP Client**: Axios

### Backend (Render)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT + Refresh Tokens
- **File Upload**: Multer + GridFS
- **Security**: Helmet, CORS, Rate Limiting

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Git

### Backend Setup
```bash
cd backend
npm install
# Set up environment variables
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Admin Credentials

- **Email**: admin@patherkhonje.com
- **Password**: admin@123

## 📁 Project Structure

```
pather-khonje/
├── backend/           # Node.js API server
│   ├── config/        # Configuration files
│   ├── middleware/    # Express middleware
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   ├── utils/         # Utility functions
│   └── server.js      # Main server file
├── frontend/          # React application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/     # Page components
│   │   ├── services/  # API services
│   │   └── config/    # Frontend config
│   └── public/        # Static assets
└── render.yaml        # Render deployment config
```

## 🚀 Deployment

### Backend (Render)
1. Connect GitHub repository to Render
2. Set Root Directory to `backend`
3. Configure environment variables
4. Deploy

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set Root Directory to `frontend`
3. Configure environment variables
4. Deploy

## 🔧 Environment Variables

### Backend (Render)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
SESSION_SECRET=...
COOKIE_SECRET=...
ALLOWED_ORIGINS=https://pather-khonje.vercel.app,https://pather-khonje.onrender.com
```

### Frontend (Vercel)
```
VITE_API_URL=https://pather-khonje.onrender.com/api
VITE_APP_NAME=Pather Khonje
VITE_NODE_ENV=production
```

## 📊 Features

### Admin Dashboard
- User management
- Place management
- Hotel management
- Package management
- Analytics and statistics
- Audit logs
- Security monitoring

### Public Features
- Browse destinations
- View hotels and packages
- Contact information
- Gallery
- Responsive design

## 🛡️ Security Features

- JWT authentication with refresh tokens
- Rate limiting
- CORS protection
- Input validation and sanitization
- XSS protection
- Helmet security headers
- Session management
- Password hashing with bcrypt

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/audit` - Get audit logs

### Places
- `GET /api/places` - Get all places
- `POST /api/places` - Create place (admin)
- `PUT /api/places/:id` - Update place (admin)

### Hotels
- `GET /api/hotels` - Get all hotels
- `POST /api/hotels` - Create hotel (admin)
- `PUT /api/hotels/:id` - Update hotel (admin)

### Packages
- `GET /api/packages` - Get all packages
- `POST /api/packages` - Create package (admin)
- `PUT /api/packages/:id` - Update package (admin)

## 🔍 Monitoring

- Health check endpoint: `/api/health`
- Comprehensive logging with Winston
- Error tracking and monitoring
- Performance metrics

## 📞 Support

For technical support or questions, contact the development team.

## 📄 License

MIT License - see LICENSE file for details.