# Google OAuth Setup Guide

This guide will help you set up Google Sign-In/Sign-Up functionality for your feedback application.

## Prerequisites

1. A Google Cloud Console account
2. Access to your application's environment variables

## Step 1: Create Google OAuth 2.0 Credentials

1. **Go to Google Cloud Console:**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project or create a new one

2. **Enable Google+ API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google Identity Services"

3. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application" as the application type
   - Add authorized origins:
     - `http://localhost:5173` (for development)
     - Your production domain
   - Add authorized redirect URIs:
     - `http://localhost:5173/auth/google/callback` (for development)
     - Your production callback URL

4. **Copy your credentials:**
   - Copy the Client ID and Client Secret

## Step 2: Update Environment Variables

### Backend (.env file in Backend folder):
```env
# Add these lines to your existing .env file
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### Frontend (.env file in Frontend folder):
```env
# Add this line to your existing .env file
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

**Important:** Replace `your_google_client_id_here` and `your_google_client_secret_here` with the actual values from Google Cloud Console.

## Step 3: Restart Your Servers

After updating the environment variables:

1. **Stop both frontend and backend servers** (Ctrl+C)
2. **Restart the backend:**
   ```bash
   cd Backend
   npm run dev
   ```
3. **Restart the frontend:**
   ```bash
   cd Frontend
   npm run dev
   ```

## Step 4: Test the Integration

1. Navigate to the login page: `http://localhost:5173/login`
2. You should see a "Sign in with Google" button
3. Click the button and test the Google Sign-In flow
4. Similarly, test the "Sign up with Google" button on the signup page

## Features Implemented

### Backend Features:
- ✅ Google OAuth 2.0 authentication
- ✅ User model updated to support Google authentication
- ✅ JWT token generation for Google users
- ✅ Automatic user creation for new Google users
- ✅ Account linking for existing users

### Frontend Features:
- ✅ Google Sign-In button component
- ✅ Integration with Google Identity Services
- ✅ Error handling for failed authentication
- ✅ Automatic redirect after successful authentication
- ✅ Support for both login and signup flows

## API Endpoints Added

### POST `/api/v1/user/google/auth`
Authenticates a user with Google JWT credential.

**Request Body:**
```json
{
  "credential": "google_jwt_token_here"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": { /* user object */ },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  },
  "message": "Google authentication successful",
  "success": true
}
```

### GET `/api/v1/user/google/auth-url`
Returns Google OAuth URL (for alternative implementation).

## Security Notes

1. **Never commit your actual Google credentials to version control**
2. **Use different credentials for development and production**
3. **Ensure your authorized origins and redirect URIs are correctly configured**
4. **The Google Client Secret should only be stored on the backend**

## Troubleshooting

### Common Issues:

1. **"Invalid client" error:**
   - Check that your Client ID is correctly set in environment variables
   - Verify the Client ID in Google Cloud Console

2. **"Unauthorized JavaScript origin" error:**
   - Add your development URL (`http://localhost:5173`) to authorized origins in Google Cloud Console

3. **Google button not appearing:**
   - Check browser console for JavaScript errors
   - Ensure the Google Client ID environment variable is set correctly
   - Verify that the Google Identity Services script is loading

4. **Authentication fails silently:**
   - Check the backend logs for errors
   - Verify that the Google Client Secret is set correctly
   - Ensure your backend is running and accessible

## Next Steps

After successful setup, you can:
- Customize the Google Sign-In button appearance
- Add additional Google scopes if needed
- Implement account linking for users with existing accounts
- Add Google Sign-In to other parts of your application

## Support

If you encounter issues:
1. Check the browser console for frontend errors
2. Check the backend server logs for API errors
3. Verify all environment variables are set correctly
4. Ensure Google Cloud Console configuration matches your setup
