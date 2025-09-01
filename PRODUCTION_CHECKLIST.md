# Production Deployment Checklist for Google OAuth

## 🔐 Security & Environment Configuration

### 1. Environment Variables - Production Setup

#### Backend (.env for production):
```env
NODE_ENV=production
PORT=443  # or your production port
MONGODB_URI=your_production_mongodb_uri
CORS_ORIGIN=https://yourdomain.com  # Your actual production domain

# JWT Secrets - Generate new ones for production
ACCESS_TOKEN_SECRET=your_super_secure_64_char_secret_here
ACCESS_TOKEN_EXPIRY=15m  # Shorter for production
REFRESH_TOKEN_SECRET=your_different_super_secure_64_char_secret_here
REFRESH_TOKEN_EXPIRY=7d  # Shorter for production

# Google OAuth - Production credentials
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret

# Other services
CLOUDINARY_CLOUD_NAME=your_production_cloudinary_name
CLOUDINARY_API_KEY=your_production_cloudinary_key
CLOUDINARY_API_SECRET=your_production_cloudinary_secret
DB_NAME=your_production_db_name
```

#### Frontend (.env.production):
```env
VITE_NODE_ENV=production
VITE_API_BASE_URL=/api/v1
VITE_BACKEND_URL=https://api.yourdomain.com  # Your production API URL
VITE_GOOGLE_CLIENT_ID=your_production_google_client_id

# Disable debug flags in production
VITE_DEBUG_API=false
VITE_DEBUG_COMPONENTS=false

VITE_APP_NAME=Feedback Form Builder
VITE_APP_VERSION=1.0.0
```

### 2. Google Cloud Console - Production Configuration

#### Required Settings:
1. **Authorized JavaScript origins:**
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`

2. **Authorized redirect URIs:**
   - `https://yourdomain.com/auth/google/callback`
   - `https://www.yourdomain.com/auth/google/callback`

3. **OAuth consent screen:**
   - Set to "External" for public apps
   - Add privacy policy and terms of service URLs
   - Add authorized domains
   - Request only necessary scopes: email, profile

## 🛡️ Backend Security Fixes

### 1. Enhanced Cookie Security
```javascript
// In user.controller.js - Update cookie options
const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined
};
```

### 2. CORS Configuration
```javascript
// In app.js - Update CORS settings
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'https://www.yourdomain.com']
    : process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
```

### 3. Rate Limiting
Add rate limiting for authentication endpoints:
```javascript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later.'
});

// Apply to Google auth routes
router.route("/google/auth").post(authLimiter, googleAuth);
```

### 4. Enhanced JWT Verification
```javascript
// In user.controller.js - More robust JWT verification
const decodeGoogleJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    );
    
    // Enhanced validation
    const now = Math.floor(Date.now() / 1000);
    
    if (!payload.iss || !payload.aud || !payload.exp || !payload.sub || !payload.email) {
      throw new Error('Missing required JWT claims');
    }
    
    if (payload.exp < now) {
      throw new Error('Token expired');
    }
    
    if (payload.iat && payload.iat > now + 300) { // Allow 5 minute clock skew
      throw new Error('Token used before issued');
    }
    
    if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) {
      throw new Error('Invalid issuer');
    }
    
    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      throw new Error('Invalid audience');
    }
    
    if (!payload.email_verified) {
      throw new Error('Email not verified by Google');
    }
    
    return payload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error.message}`);
  }
};
```

## 🌐 Frontend Production Optimizations

### 1. Enhanced Error Handling
```javascript
// In GoogleSignInButton.jsx
const handleCredentialResponse = async (response) => {
  try {
    const result = await api.post(endpoints.auth.googleAuth, {
      credential: response.credential
    });

    if (result.data.data) {
      setIsAuthenticated(true);
      setUserData(result.data.data);
      onSuccess && onSuccess(result.data.data);
    }
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    
    // Production-friendly error messages
    let errorMessage = 'Authentication failed. Please try again.';
    
    if (error.response?.status === 400) {
      errorMessage = 'Invalid authentication. Please try again.';
    } else if (error.response?.status === 429) {
      errorMessage = 'Too many attempts. Please wait and try again.';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    onError && onError(new Error(errorMessage));
  }
};
```

### 2. Production Button Configuration
```javascript
// In GoogleSignInButton.jsx
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  
  script.onload = () => {
    if (window.google && process.env.NODE_ENV !== 'development') {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true, // Enhanced security for production
      });
    }
  };
  
  document.head.appendChild(script);
  
  return () => {
    if (document.head.contains(script)) {
      document.head.removeChild(script);
    }
  };
}, []);
```

## 🚀 Deployment Configuration

### 1. SSL/HTTPS Setup
- **Required**: HTTPS is mandatory for Google OAuth in production
- Configure SSL certificates (Let's Encrypt recommended)
- Redirect all HTTP traffic to HTTPS

### 2. Build Configuration
```json
// In package.json - Production build scripts
{
  "scripts": {
    "build": "vite build",
    "build:prod": "NODE_ENV=production vite build",
    "start:prod": "NODE_ENV=production node server.js"
  }
}
```

### 3. Server Configuration (nginx example)
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    location /api/ {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        root /path/to/your/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔍 Monitoring & Logging

### 1. Enhanced Logging
```javascript
// In user.controller.js
const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress;
  
  console.log(`Google auth attempt from IP: ${clientIP}`);
  
  try {
    const payload = decodeGoogleJWT(credential);
    console.log(`Google auth successful for: ${payload.email}`);
    
    // ... rest of the code
  } catch (error) {
    console.error(`Google auth failed from IP ${clientIP}:`, error.message);
    throw new ApiError(400, `Google authentication failed: ${error.message}`);
  }
});
```

### 2. Health Check Endpoint
```javascript
// Add to your routes
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  });
});
```

## 📋 Pre-Deployment Checklist

- [ ] Update all environment variables for production
- [ ] Configure Google Cloud Console for production domain
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS for production domains
- [ ] Enable rate limiting on auth endpoints
- [ ] Set up monitoring and logging
- [ ] Test OAuth flow on staging environment
- [ ] Update cookie security settings
- [ ] Configure server/proxy settings
- [ ] Set up database backups
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Test with production Google Client ID

## 🔧 Additional Security Measures

1. **Content Security Policy (CSP)**
2. **OWASP security headers**
3. **Regular dependency updates**
4. **Database connection security**
5. **API endpoint documentation**
6. **User data privacy compliance**

## 📝 Testing in Production

1. Test Google Sign-In with multiple accounts
2. Verify token expiration handling
3. Test rate limiting functionality
4. Verify CORS functionality
5. Test error scenarios
6. Monitor performance metrics
