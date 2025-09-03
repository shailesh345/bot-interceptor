# User Management Scripts for Traffic Interceptor

This directory contains scripts to create and manage users in the Traffic Interceptor SaaS system.

## 🚀 Quick Start

### 1. Create All Users at Once
```bash
python create_comprehensive_users.py
```

This script creates a complete set of users for testing and development:
- 👑 **Super Admin** (superadmin / superadmin123)
- 👨‍💼 **Admin** (admin / admin123)
- 👥 **Client/Tenant** (client / client123)
- 🎯 **MVP User** (mvpuser / mvp123)
- 🧪 **Demo Users** (demo_admin, demo_client, demo_mvp)

### 2. Create Individual Users
```bash
python create_user.py [role] [email] [username] [password] [first_name] [last_name]
```

**Examples:**
```bash
# Create a super admin with defaults
python create_user.py super_admin

# Create an admin with custom details
python create_user.py admin admin@company.com adminuser adminpass

# Create a client user with full details
python create_user.py user client@company.com clientuser clientpass John Client
```

### 3. List All Users
```bash
python list_all_users.py
```

## 👥 User Roles & Permissions

### Super Admin (`super_admin`)
- **Access**: Full system access
- **Tenant**: No tenant (system-wide access)
- **Capabilities**: 
  - User management
  - Tenant management
  - System configuration
  - All features enabled

### Admin (`admin`)
- **Access**: Tenant-level administration
- **Tenant**: Assigned to specific tenant
- **Capabilities**:
  - User management within tenant
  - Domain management
  - Analytics and monitoring
  - Security settings

### User (`user`)
- **Access**: Standard user access
- **Tenant**: Assigned to specific tenant
- **Capabilities**:
  - Domain monitoring
  - Basic analytics
  - Traffic interception
  - Limited admin features

## 🏢 Tenant Structure

Users are organized into tenants for multi-tenancy:

- **Default Organization**: Main tenant for development/testing
- **Test Tenant**: Additional tenant for testing
- **Custom Tenants**: Can be created for different clients

## 🔐 Default Passwords

**⚠️ IMPORTANT: Change all passwords after first login!**

| Role | Username | Password | Email |
|------|----------|----------|-------|
| Super Admin | superadmin | superadmin123 | superadmin@trafficinterceptor.com |
| Admin | admin | admin123 | admin@trafficinterceptor.com |
| Client | client | client123 | client@example.com |
| MVP User | mvpuser | mvp123 | mvp@example.com |
| Demo Admin | demo_admin | demo123 | demo.admin@example.com |
| Demo Client | demo_client | demo123 | demo.client@example.com |
| Demo MVP | demo_mvp | demo123 | demo.mvp@example.com |

## 🛠️ Script Details

### `create_comprehensive_users.py`
- Creates all user types at once
- Sets up default tenant if needed
- Includes demo users for testing
- Provides comprehensive output

### `create_user.py`
- Creates individual users on demand
- Validates role and user details
- Prevents duplicate users
- Flexible parameter handling

### `list_all_users.py`
- Shows all users in the system
- Groups users by role
- Displays user statistics
- Shows tenant assignments

## 🔧 Prerequisites

1. **Database**: Ensure database is initialized
2. **Models**: User and Tenant models must exist
3. **App Context**: Flask app must be properly configured
4. **Dependencies**: All required packages installed

## 🚨 Security Notes

1. **Default Passwords**: All users have simple default passwords
2. **Production Use**: Change passwords immediately in production
3. **Role Assignment**: Carefully consider role assignments
4. **Tenant Isolation**: Ensure proper tenant isolation
5. **Access Control**: Implement proper access controls

## 📱 Frontend Access

After creating users, access the system at:
- **URL**: http://localhost:9889
- **Backend**: http://localhost:8960

## 🧪 Testing

Use the demo users for testing different scenarios:
- **Demo Admin**: Test admin functionality
- **Demo Client**: Test client features
- **Demo MVP**: Test MVP-specific features

## 🔄 Maintenance

### Regular Tasks
- Review user access levels
- Update user permissions
- Monitor user activity
- Clean up inactive users

### Troubleshooting
- Check database connections
- Verify app configuration
- Review error logs
- Test user authentication

## 📞 Support

For issues with user management:
1. Check the logs for errors
2. Verify database connectivity
3. Test individual scripts
4. Review user model definitions

---

**Last Updated**: September 2, 2025
**Version**: 1.0.0
