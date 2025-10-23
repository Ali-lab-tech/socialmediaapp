# Social Media App - API Documentation

## Overview
This document explains how data flows from the frontend Vue.js application to the backend NestJS API and how it's stored in the MySQL database, including JWT token generation and authentication flow.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [User Registration Flow](#user-registration-flow)
3. [User Login Flow](#user-login-flow)
4. [JWT Token Generation](#jwt-token-generation)
5. [Profile Update Flow](#profile-update-flow)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Security Features](#security-features)

## Architecture Overview

```
Frontend (Vue.js) → Backend (NestJS) → Database (MySQL)
     ↓                    ↓                ↓
  Form Data          JWT Authentication   User Storage
  Validation         Password Hashing     Data Persistence
```

## User Registration Flow

### 1. Frontend Form Submission
**File:** `frontend/frontendapp/src/components/auth/register.vue`

```javascript
// Form data collection
data() {
  return {
    username: '',
    password: '',
    name: '',
    email: '',  // Added email field
  };
}

// Form submission
async signup() {
  const response = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      username: this.username, 
      password: this.password, 
      name: this.name, 
      email: this.email  // Email included in request
    }),
  });
}
```

### 2. Backend Processing
**File:** `backend/backend-app/src/auth/auth.controller.ts`

```typescript
@Post('register')
async register(@Body() registerDto: { 
  username: string; 
  password: string; 
  name: string; 
  email?: string 
}) {
  return this.authService.register(
    registerDto.username,
    registerDto.password,
    registerDto.name,
    registerDto.email,  // Email passed to service
  );
}
```

### 3. Service Layer Processing
**File:** `backend/backend-app/src/auth/auth.service.ts`

```typescript
async register(username: string, password: string, name: string, email?: string) {
  // 1. Check if user already exists
  const existingUser = await this.userRepository.findOne({ where: { username } });
  if (existingUser) {
    throw new ConflictException('Username already exists');
  }

  // 2. Hash password using bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Create user entity
  const user = this.userRepository.create({
    username,
    password: hashedPassword,  // Store hashed password
    name,
    email,  // Store email in database
  });

  // 4. Save to database
  const savedUser = await this.userRepository.save(user);
  
  // 5. Generate JWT token
  const payload = { username: savedUser.username, sub: savedUser.id };
  const access_token = this.jwtService.sign(payload);

  // 6. Return response with token and user data
  return {
    access_token,
    user: {
      id: savedUser.id,
      username: savedUser.username,
      name: savedUser.name,
      email: savedUser.email,  // Email returned to frontend
    },
  };
}
```

### 4. Database Storage
**File:** `backend/backend-app/src/auth/entities/user.entity.ts`

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;  // Hashed password stored

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;  // Email field in database

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## User Login Flow

### 1. Frontend Login Form
**File:** `frontend/frontendapp/src/components/auth/login.vue`

```javascript
async login() {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      username: this.username, 
      password: this.password 
    }),
  });
  
  if (response.ok) {
    const data = await response.json();
    // Store JWT token and user data
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
}
```

### 2. Backend Authentication
**File:** `backend/backend-app/src/auth/auth.service.ts`

```typescript
async validateUser(username: string, password: string): Promise<any> {
  // 1. Find user by username
  const user = await this.userRepository.findOne({ where: { username } });
  
  // 2. Compare provided password with hashed password
  if (user && await bcrypt.compare(password, user.password)) {
    const { password, ...result } = user;  // Remove password from result
    return result;
  }
  return null;  // Invalid credentials
}

async login(user: any) {
  // 3. Generate JWT token
  const payload = { username: user.username, sub: user.id };
  return {
    access_token: this.jwtService.sign(payload),
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,  // Include email in response
    },
  };
}
```

## JWT Token Generation

### 1. JWT Configuration
**File:** `backend/backend-app/src/auth/auth.module.ts`

```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  signOptions: { expiresIn: '24h' },  // Token expires in 24 hours
}),
```

### 2. Token Payload Structure
```typescript
const payload = { 
  username: user.username,  // User identifier
  sub: user.id             // Subject (user ID)
};
```

### 3. Token Usage
- **Frontend:** Stores token in localStorage
- **Backend:** Validates token on protected routes
- **Expiration:** Tokens expire after 24 hours

## Profile Update Flow

### 1. Frontend Profile Form
**File:** `frontend/frontendapp/src/components/user/profileUpdate.vue`

```javascript
async updateProfile() {
  const updateData = {
    username: this.profileForm.username,
    name: this.profileForm.name,
    email: this.profileForm.email,
    currentPassword: this.profileForm.currentPassword
  };
  
  const response = await fetch('http://localhost:3000/auth/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,  // JWT token
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
}
```

### 2. Backend Profile Update
**File:** `backend/backend-app/src/auth/auth.service.ts`

```typescript
async updateProfile(userId: number, updateData: { 
  username?: string; 
  name?: string; 
  email?: string; 
  currentPassword?: string; 
  newPassword?: string 
}) {
  // 1. Find user by ID
  const user = await this.userRepository.findOne({ where: { id: userId } });
  
  // 2. Verify current password
  if (updateData.currentPassword && !await bcrypt.compare(updateData.currentPassword, user.password)) {
    throw new UnauthorizedException('Current password is incorrect');
  }

  // 3. Check username uniqueness if changing
  if (updateData.username && updateData.username !== user.username) {
    const existingUser = await this.userRepository.findOne({ where: { username: updateData.username } });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }
  }

  // 4. Update user data
  const updateFields: any = {};
  if (updateData.username) updateFields.username = updateData.username;
  if (updateData.name) updateFields.name = updateData.name;
  if (updateData.email !== undefined) updateFields.email = updateData.email;
  
  // 5. Update password if provided
  if (updateData.newPassword) {
    updateFields.password = await bcrypt.hash(updateData.newPassword, 10);
  }

  // 6. Save to database
  await this.userRepository.update(userId, updateFields);
  
  // 7. Return updated user data
  const updatedUser = await this.userRepository.findOne({ where: { id: userId } });
  return {
    id: updatedUser.id,
    username: updatedUser.username,
    name: updatedUser.name,
    email: updatedUser.email,
  };
}
```

## Database Schema

### Users Table Structure
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- Hashed password
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,        -- Email field
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Sample Data Flow
```
Registration:
Frontend: { username: "john", password: "123456", name: "John Doe", email: "john@example.com" }
    ↓
Backend: { username: "john", password: "$2b$10$...", name: "John Doe", email: "john@example.com" }
    ↓
Database: INSERT INTO users (username, password, name, email) VALUES (...)
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/auth/register` | Register new user | `{username, password, name, email}` | `{access_token, user}` |
| POST | `/auth/login` | User login | `{username, password}` | `{access_token, user}` |
| GET | `/auth/profile` | Get user profile | Headers: `Authorization: Bearer <token>` | `{id, username, name, email}` |
| PUT | `/auth/profile` | Update user profile | `{username?, name?, email?, currentPassword?, newPassword?}` | `{id, username, name, email}` |
| GET | `/auth/verify` | Verify token | Headers: `Authorization: Bearer <token>` | `{valid: true, user}` |

### Protected Endpoints

| Method | Endpoint | Description | Headers Required |
|--------|----------|-------------|-------------------|
| GET | `/feed/user-feed` | Get user feed | `Authorization: Bearer <token>` |

## Security Features

### 1. Password Security
- **Hashing:** Passwords are hashed using bcrypt with salt rounds of 10
- **No Plain Text:** Passwords are never stored in plain text
- **Verification:** Current password required for profile updates

### 2. JWT Authentication
- **Token-based:** Stateless authentication using JWT tokens
- **Expiration:** Tokens expire after 24 hours
- **Secret Key:** Uses environment variable or fallback secret
- **Payload:** Contains user ID and username

### 3. Input Validation
- **Required Fields:** Username, password, and name are required
- **Unique Constraints:** Username must be unique
- **Email Validation:** Email field is optional but validated when provided

### 4. CORS Configuration
```typescript
app.enableCors({
  origin: 'http://localhost:8080',  // Vue.js dev server
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});
```

## Data Flow Summary

1. **Frontend** collects form data (username, password, name, email)
2. **Frontend** sends POST request to backend API
3. **Backend** validates input and checks for existing users
4. **Backend** hashes password using bcrypt
5. **Backend** saves user data to MySQL database
6. **Backend** generates JWT token with user payload
7. **Backend** returns token and user data to frontend
8. **Frontend** stores token in localStorage for future requests
9. **Frontend** uses token in Authorization header for protected routes

## Error Handling

### Common Error Responses
- **400 Bad Request:** Invalid input data
- **401 Unauthorized:** Invalid credentials or expired token
- **409 Conflict:** Username already exists
- **500 Internal Server Error:** Database or server errors

### Frontend Error Handling
```javascript
try {
  const response = await fetch(url, options);
  if (response.ok) {
    // Success handling
  } else {
    alert('Operation failed. Please try again.');
  }
} catch (error) {
  console.error('Error:', error);
  alert('Network error. Please check your connection.');
}
```

This documentation provides a complete overview of how data flows through the application, from frontend forms to database storage, including security measures and error handling.
