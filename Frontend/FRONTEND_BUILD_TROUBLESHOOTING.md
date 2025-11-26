# 🚨 Frontend Build Troubleshooting Guide

## 🔍 Common Build Errors

### **Error: `npx react-scripts build` fails**

This is typically caused by:
- React 19 compatibility issues with react-scripts 5.0.1
- Missing dependencies
- Environment variable conflicts
- Node.js version incompatibility

## 🛠️ Solutions

### **1. Use Docker-Specific Build Script**

The Dockerfile now uses a specialized build script:
```bash
npm run build:docker
```

This script sets all necessary environment variables:
- `DISABLE_ESLINT_PLUGIN=true`
- `GENERATE_SOURCEMAP=false`
- `CI=false`
- `SKIP_PREFLIGHT_CHECK=true`

### **2. Check Dependencies**

Ensure all dependencies are properly installed:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps --force
```

### **3. Verify React-Scripts**

Check if react-scripts is properly installed:
```bash
npm list react-scripts
```

### **4. Environment Variables**

Set these environment variables before building:
```bash
export DISABLE_ESLINT_PLUGIN=true
export GENERATE_SOURCEMAP=false
export CI=false
export NODE_ENV=production
export SKIP_PREFLIGHT_CHECK=true
export FAST_REFRESH=false
```

## 🐳 Docker Build Commands

### **Build Frontend Only**
```bash
docker-compose build frontend
```

### **Build with No Cache**
```bash
docker-compose build --no-cache frontend
```

### **View Build Logs**
```bash
docker-compose build frontend 2>&1 | tee build.log
```

## 🔧 Manual Build Testing

### **1. Test Local Build**
```bash
cd Frontend
npm install --legacy-peer-deps --force
npm run build:docker
```

### **2. Run Debug Script**
```bash
chmod +x build-debug.sh
./build-debug.sh
```

### **3. Check Node Version**
```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 8.x or higher
```

## 📦 Package.json Scripts

### **Available Build Scripts**
- `npm run build` - Standard build
- `npm run build:prod` - Production build with optimizations
- `npm run build:docker` - Docker-optimized build
- `npm run postinstall` - Auto-build after install

## 🚨 Common Issues & Fixes

### **Issue 1: Module not found**
```bash
# Solution: Clean reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps --force
```

### **Issue 2: React-Scripts not found**
```bash
# Solution: Install explicitly
npm install react-scripts@5.0.1 --save-dev
```

### **Issue 3: Build timeout**
```bash
# Solution: Increase Docker build timeout
docker-compose build --timeout 600 frontend
```

### **Issue 4: Memory issues**
```bash
# Solution: Increase Docker memory limit
docker-compose build --memory=4g frontend
```

## 🔍 Debugging Steps

### **Step 1: Check Docker Logs**
```bash
docker-compose logs frontend
```

### **Step 2: Enter Container**
```bash
docker-compose run --rm frontend sh
```

### **Step 3: Manual Build Test**
```bash
# Inside container
npm install --legacy-peer-deps --force
npm run build:docker
```

### **Step 4: Check Dependencies**
```bash
# Inside container
npm list --depth=0
npm list react-scripts
```

## 📋 Build Environment Checklist

- [ ] Node.js 18+ installed
- [ ] npm 8+ installed
- [ ] All dependencies installed
- [ ] Environment variables set
- [ ] react-scripts 5.0.1 installed
- [ ] Package.json scripts available
- [ ] Docker build context correct
- [ ] No conflicting .env files

## 🎯 Quick Fix Commands

### **Complete Reset**
```bash
# Stop containers
docker-compose down

# Remove build cache
docker system prune -f

# Rebuild frontend
docker-compose build --no-cache frontend

# Start services
docker-compose up -d
```

### **Dependency Reset**
```bash
cd Frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps --force
npm run build:docker
```

## 📚 Additional Resources

- [React 19 Migration Guide](https://react.dev/blog/2024/02/15/react-labs-what-we-have-been-working-on-february-2024)
- [Create React App Troubleshooting](https://create-react-app.dev/docs/troubleshooting)
- [Docker Build Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🆘 Still Having Issues?

If the problem persists:

1. **Check the build logs** for specific error messages
2. **Verify Node.js version** compatibility
3. **Test local build** outside Docker
4. **Check for conflicting dependencies**
5. **Review environment variables**

Run the debug script for detailed diagnostics:
```bash
./build-debug.sh
```
