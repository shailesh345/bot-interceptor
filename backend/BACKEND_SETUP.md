# 🚀 Traffic Interceptor Backend Setup Guide

## 📋 Overview
This guide will help you set up and run the Traffic Interceptor backend server.

## 🛠️ Prerequisites
- Python 3.8+ installed
- pip package manager
- Basic knowledge of Flask and Python

## 📦 Quick Start

### 1. Install Dependencies
```bash
# Install from working requirements (recommended)
pip install -r requirements_working.txt

# Or install minimal requirements if above fails
pip install -r requirements_minimal.txt

# Or install basic Flask packages manually
pip install Flask Flask-SQLAlchemy Flask-CORS Flask-JWT-Extended
```

### 2. Initialize Database
```bash
python init_database.py
```
This will:
- Create all database tables
- Create a default tenant
- Create super admin user (admin/admin123)
- Create demo user (demo/demo123)
- Create demo domain

### 3. Test Backend
```bash
python test_backend.py
```
This will verify that:
- All imports work correctly
- App can be created
- Database connection works

### 4. Start Backend Server
```bash
# Option 1: Use the startup script (recommended)
python start_backend.py

# Option 2: Start directly
python app.py

# Option 3: Use Flask CLI
flask run --host=0.0.0.0 --port=8960
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
FLASK_CONFIG=development
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///traffic_interceptor.db
JWT_SECRET_KEY=your-jwt-secret-here
REDIS_URL=redis://localhost:6379/0
```

### Database Configuration
The backend uses SQLite by default for development. For production, you can configure:
- PostgreSQL
- MySQL
- Other SQL databases supported by SQLAlchemy

## 📁 Project Structure
```
backend/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── models.py            # Database models
│   ├── api/                 # API endpoints
│   ├── auth/                # Authentication routes
│   ├── admin/               # Admin routes
│   ├── interceptor/         # Traffic interception logic
│   └── websocket/           # WebSocket handling
├── app.py                   # Main application entry point
├── config.py                # Configuration settings
├── requirements_working.txt  # Working dependencies
├── init_database.py         # Database initialization
├── test_backend.py          # Backend testing
└── start_backend.py         # Startup script
```

## 🚀 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `POST /auth/change-password` - Change password
- `POST /auth/logout` - User logout

### Admin (Super Admin Only)
- `GET /admin/users` - Get all users
- `PUT /admin/users/<id>` - Update user
- `DELETE /admin/users/<id>` - Delete user
- `GET /admin/system/health` - System health status
- `GET /admin/system/stats` - System statistics
- `GET /admin/tenants` - Get all tenants

### Core API
- `GET /api/domains` - Get user domains
- `GET /api/analytics/*` - Analytics endpoints
- `GET /api/billing/*` - Billing endpoints
- `GET /api/ml/*` - ML model endpoints
- `GET /api/security/*` - Security endpoints

## 🔐 Default Users

After running `init_database.py`, you'll have:

### Super Admin
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `super_admin`
- **Access**: Full system access

### Demo User
- **Username**: `demo`
- **Password**: `demo123`
- **Role**: `user`
- **Access**: Basic user features

## 🧪 Testing

### Test Backend Health
```bash
curl http://localhost:5001/health
```

### Test Authentication
```bash
# Register a new user
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"test123","first_name":"Test","last_name":"User"}'

# Login
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Import Errors
```bash
# Install missing dependencies
pip install -r requirements_working.txt
```

#### 2. Database Errors
```bash
# Reinitialize database
python init_database.py
```

#### 3. Port Already in Use
```bash
# Kill process using port 5001
lsof -ti:5001 | xargs kill -9
```

#### 4. Permission Errors
```bash
# Make scripts executable
chmod +x *.py
```

### Debug Mode
To run in debug mode, set:
```bash
export FLASK_DEBUG=1
python app.py
```

## 📊 Monitoring

### Health Check
- Endpoint: `/health`
- Returns system status and service health

### Logs
- Check `server.log` for application logs
- Flask debug mode shows detailed error information

## 🔄 Development Workflow

1. **Make Changes**: Edit source files
2. **Test**: Run `python test_backend.py`
3. **Start**: Run `python start_backend.py`
4. **Debug**: Check logs and error messages
5. **Restart**: Stop and restart server after changes

## 🚀 Production Deployment

For production deployment:
1. Set `FLASK_CONFIG=production`
2. Use proper database (PostgreSQL/MySQL)
3. Set secure secret keys
4. Enable HTTPS
5. Use production WSGI server (Gunicorn)
6. Set up proper logging and monitoring

## 📞 Support

If you encounter issues:
1. Check the logs in `server.log`
2. Verify all dependencies are installed
3. Ensure database is properly initialized
4. Check configuration settings

---

**🎯 Ready to intercept some traffic? Start the backend and connect your frontend!**
