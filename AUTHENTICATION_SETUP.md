# Mary Joy Authentication System Setup

This document provides instructions for setting up the authentication system for the Mary Joy Sponsorship Digitalizing Project.

## Overview

The authentication system supports 4 user roles:
- **Admin**: Full system access
- **Database Officer**: Data management and beneficiary/sponsor management
- **Coordinator**: Program coordination and feedback management
- **Sponsor**: Sponsor-specific dashboard access

## Database Structure

### User Credentials Table
The system uses a `user_credentials` table that stores login information for all user types:

```sql
CREATE TABLE user_credentials (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone_number VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'database_officer', 'coordinator', 'sponsor')),
  employee_id INTEGER REFERENCES employees(id),
  sponsor_cluster_id VARCHAR(10),
  sponsor_specific_id VARCHAR(10),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMP,
  login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Employee Table Updates
The `employees` table has been updated to support the new role structure:

```sql
ALTER TABLE employees 
ADD COLUMN role VARCHAR(20) CHECK (role IN ('admin', 'database_officer', 'coordinator'));
ALTER TABLE employees 
ADD COLUMN department VARCHAR(100);
ALTER TABLE employees 
ADD COLUMN position VARCHAR(100);
```

## Setup Instructions

### 1. Database Setup

Run the database migration to create the user_credentials table:

```bash
cd backend
node migrations/create_user_credentials.js
```

### 2. Create Initial Users

Run the setup script to create default users:

```bash
cd backend
node setup_auth.js
```

This will create:
- Admin user: `admin@maryjoy.org` / `admin123`
- Database Officer: `db.officer@maryjoy.org` / `dbofficer123`
- Coordinator: `coordinator@maryjoy.org` / `coordinator123`
- Test Sponsor (if sponsor exists): `sponsor@example.com` / `sponsor123`

### 3. Environment Variables

Create a `.env` file in the backend directory:

```env
DB_NAME=maryjoy_db
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production-maryjoy-ethiopia-2024
```

### 4. Install Dependencies

Make sure all required packages are installed:

```bash
cd backend
npm install jsonwebtoken bcrypt
```

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user credentials
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/change-password` - Change user password
- `POST /api/auth/logout` - Logout (client-side token removal)

### Login Request Format

```json
{
  "identifier": "email@example.com", // or phone number
  "password": "password123"
}
```

### Login Response Format

```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "role": "admin",
    "userId": "1",
    "fullName": "System Administrator",
    "email": "admin@maryjoy.org",
    "phone": "+251911000000",
    "lastLogin": "2024-01-15T10:30:00Z"
  }
}
```

## Frontend Integration

### Authentication Context

The frontend uses an `AuthContext` that provides:
- User authentication state
- Login/logout functions
- Role-based access control
- Token management

### Protected Routes

Routes are protected using the `ProtectedRoute` component:

```jsx
<ProtectedRoute requiredRoles="admin">
  <AdminDashboard />
</ProtectedRoute>

<ProtectedRoute requiredRoles={["admin", "database_officer"]}>
  <BeneficiaryList />
</ProtectedRoute>
```

### Role-Based Navigation

After login, users are redirected based on their role:
- Admin → `/admin_dashboard`
- Database Officer → `/d_o_dashboard`
- Coordinator → `/coordinator_dashboard`
- Sponsor → `/sponsor_dashboard`

## Security Features

### Password Security
- Passwords are hashed using bcrypt with 12 salt rounds
- Strong password requirements can be added

### Account Lockout
- Accounts are locked after 5 failed login attempts
- Lock duration: 2 hours
- Automatic unlock after lock period expires

### JWT Tokens
- Tokens expire after 24 hours
- Secure token verification on protected routes
- Automatic token refresh on app load

### Session Management
- Tokens stored in localStorage
- Automatic logout on token expiration
- Secure logout clears all session data

## User Management

### Creating New Users

#### For Employees (Admin, Database Officer, Coordinator):

1. First create an employee record:
```javascript
const employee = await Employee.create({
  full_name: 'John Doe',
  phone_number: '+251911000003',
  email: 'john@maryjoy.org',
  password_hash: await bcrypt.hash('temp_password', 12),
  role: 'database_officer',
  department: 'Data Management',
  position: 'Data Entry Officer'
});
```

2. Then create user credentials:
```javascript
const credentials = await UserCredentials.create({
  email: 'john@maryjoy.org',
  password_hash: await bcrypt.hash('user_password', 12),
  role: 'database_officer',
  employee_id: employee.id,
  is_active: true
});
```

#### For Sponsors:

```javascript
const sponsorCredentials = await UserCredentials.create({
  email: 'sponsor@example.com',
  password_hash: await bcrypt.hash('sponsor_password', 12),
  role: 'sponsor',
  sponsor_cluster_id: '02',
  sponsor_specific_id: '1001',
  is_active: true
});
```

### Password Management

Users can change their passwords using the `/api/auth/change-password` endpoint:

```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **JWT Token Errors**
   - Check JWT_SECRET is set in environment variables
   - Verify token hasn't expired
   - Ensure Authorization header format: `Bearer <token>`

3. **Role Access Denied**
   - Verify user has correct role assigned
   - Check route protection requirements
   - Ensure user account is active

4. **Login Failures**
   - Check account isn't locked
   - Verify credentials are correct
   - Check if account is active

### Testing Authentication

Test the authentication system:

```bash
cd backend
node test_auth.js
```

## Production Considerations

### Security
- Change default JWT secret
- Use strong, unique passwords
- Enable HTTPS in production
- Implement rate limiting
- Add audit logging

### Performance
- Implement token refresh mechanism
- Add database connection pooling
- Monitor login attempt patterns
- Implement caching for user data

### Monitoring
- Log authentication events
- Monitor failed login attempts
- Track user session durations
- Alert on suspicious activity

## Support

For issues or questions about the authentication system:
1. Check the troubleshooting section
2. Review the API documentation
3. Test with the provided test scripts
4. Check database logs for errors

---

**Note**: This authentication system is designed specifically for the Mary Joy Sponsorship Digitalizing Project and supports the 4 defined user roles with appropriate access controls.
