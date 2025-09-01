# Production Environment Variables for Backend
# Set these in your backend hosting service (Render, Railway, etc.)

NODE_ENV=production
PORT=9000

# Database
MONGODB_URI=your_mongodb_connection_string

# CORS Configuration (Your Frontend Domain)
CORS_ORIGIN=https://feedback-red-seven.vercel.app

# JWT Secrets (Generate new secure secrets for production)
ACCESS_TOKEN_SECRET=your_super_secure_access_token_secret_64_chars_minimum
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_different_super_secure_refresh_token_secret_64_chars
REFRESH_TOKEN_EXPIRY=7d

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_production_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_production_google_client_secret

# Cloudinary (Optional - for file uploads)
CLOUDINARY_CLOUD_NAME=your_production_cloudinary_name
CLOUDINARY_API_KEY=your_production_cloudinary_key
CLOUDINARY_API_SECRET=your_production_cloudinary_secret

# Security Settings
# DO NOT SET COOKIE_DOMAIN for cross-origin setup (different domains)
# Only use COOKIE_DOMAIN if frontend and backend share same root domain
SESSION_SECRET=your_session_secret_for_additional_security

# Monitoring (Optional)
LOG_LEVEL=error
