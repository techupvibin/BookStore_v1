# 🚀 BookStore Setup Guide

This guide will help you set up the BookStore application with all necessary configurations before committing to GitHub.

## 📋 Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- PostgreSQL 12 or higher
- Docker (optional, for containerized setup)

## 🔧 Environment Configuration

### 1. Backend Environment Variables

**Note**: Environment variables are now commented out in the configuration files. The application uses hardcoded default values for development, so no `.env` file is required for basic functionality.

If you want to use external services, you can uncomment the relevant lines in the configuration files and set up the proper environment variables.

### 2. Frontend Environment Variables

**Note**: Environment variables are now commented out in the configuration files. The application uses hardcoded default values for development, so no `.env` file is required for basic functionality.

If you want to use external services, you can uncomment the relevant lines in the configuration files and set up the proper environment variables.

## 🔑 Service Configuration

### Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Create a new account or log in
3. Copy your **Publishable key** (starts with `pk_test_`) for the frontend
4. Copy your **Secret key** (starts with `sk_test_`) for the backend
5. Add these keys to your environment files

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8080/login/oauth2/code/google`
   - `http://localhost:3000/oauth2/redirect`
6. Copy Client ID and Client Secret to your environment files

### AWS S3 Setup (Optional)

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Create an S3 bucket
3. Create IAM user with S3 permissions
4. Copy Access Key ID and Secret Access Key to your environment files

## 🐛 Common Issues and Fixes

### 1. Stripe "Invalid API Key" Error
- **Cause**: Using placeholder keys instead of real Stripe keys
- **Fix**: Replace `your-stripe-secret-key` and `your-stripe-publishable-key` with actual keys from Stripe Dashboard

### 2. Google OAuth CORS Error
- **Cause**: Missing or incorrect redirect URIs in Google Cloud Console
- **Fix**: Add `http://localhost:8080/login/oauth2/code/google` to authorized redirect URIs

### 3. 500 Server Errors
- **Cause**: Missing backend endpoints or configuration issues
- **Fix**: Check server logs and ensure all environment variables are set correctly

### 4. MUI Grid Warnings
- **Cause**: Using deprecated MUI Grid v1 syntax
- **Fix**: Update Grid components to use v2 syntax (container/item props are deprecated)

## 🚀 Running the Application

### Backend
```bash
# Install dependencies
mvn clean install

# Run the application
mvn spring-boot:run
```

### Frontend
```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 📝 Before Committing to GitHub

1. ✅ Environment variables are now commented out (no setup required)
2. ✅ Test basic application functionality
3. ✅ Test user registration and login
4. ✅ Verify all endpoints work correctly
5. ✅ Check for any remaining linting errors
6. ✅ Update documentation if needed

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use test keys for development, live keys only for production
- Keep all API keys secure and rotate them regularly
- Use strong, unique passwords for all services

## 📞 Support

If you encounter issues:
1. Check the logs in the `logs/` directory
2. Verify all environment variables are set correctly
3. Ensure all services (PostgreSQL, Redis, etc.) are running
4. Check the troubleshooting guides in the documentation
