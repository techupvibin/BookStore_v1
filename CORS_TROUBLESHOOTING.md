# 🚨 CORS Troubleshooting Guide

## 🔍 **Error Analysis**

The CORS errors you're experiencing:
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at http://localhost:8080/api/admin/settings. (Reason: CORS request did not succeed). Status code: (null).
```

This indicates that the browser is blocking requests from `http://localhost:3000` (frontend) to `http://localhost:8080` (backend) due to CORS policy.

## 🛠️ **Solutions Implemented**

### **1. Enhanced SecurityConfig CORS**
- ✅ Updated `SecurityConfig.java` with comprehensive CORS configuration
- ✅ Added fallback defaults for development
- ✅ Enhanced headers and exposed headers
- ✅ Added proper preflight request handling

### **2. Global CORS Configuration**
- ✅ Created `GlobalCorsConfig.java` as backup configuration
- ✅ Implemented `WebMvcConfigurer` for global CORS mapping
- ✅ Added permissive settings for development

### **3. CORS Test Endpoint**
- ✅ Created `CorsTestController.java` for testing CORS functionality
- ✅ Added GET, POST, and OPTIONS endpoints for testing

### **4. Application Configuration**
- ✅ Updated `application.yml` with explicit CORS settings
- ✅ Added wildcard origin for development

## 🚀 **How to Test the Fix**

### **1. Restart the Backend**
```bash
# Stop and restart the Spring Boot application
docker-compose restart bookstore_springboot_app

# Check logs for CORS configuration
docker-compose logs bookstore_springboot_app | grep -i cors
```

### **2. Test CORS Endpoint**
```bash
# Test the CORS test endpoint
curl -X GET http://localhost:8080/api/cors-test/ping

# Test with CORS headers
curl -X GET http://localhost:8080/api/cors-test/ping \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

### **3. Test from Browser Console**
Open browser console on `http://localhost:3000` and run:
```javascript
// Test CORS with fetch
fetch('http://localhost:8080/api/cors-test/ping', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(response => response.json())
.then(data => console.log('CORS Test Success:', data))
.catch(error => console.error('CORS Test Failed:', error));
```

### **4. Test Admin Settings Endpoint**
```javascript
// Test the problematic endpoint
fetch('http://localhost:8080/api/admin/settings', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(response => response.json())
.then(data => console.log('Admin Settings Success:', data))
.catch(error => console.error('Admin Settings Failed:', error));
```

## 🔧 **Manual Testing Commands**

### **1. Test Preflight Request**
```bash
# Test OPTIONS request (preflight)
curl -X OPTIONS http://localhost:8080/api/admin/settings \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

### **2. Test Actual Request**
```bash
# Test actual GET request
curl -X GET http://localhost:8080/api/admin/settings \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -v
```

### **3. Check CORS Headers**
Look for these headers in the response:
- `Access-Control-Allow-Origin: *` or `Access-Control-Allow-Origin: http://localhost:3000`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD`
- `Access-Control-Allow-Headers: *`
- `Access-Control-Allow-Credentials: true`

## 🚨 **Common Issues & Solutions**

### **Issue 1: CORS Headers Not Present**
```bash
# Solution: Check if CORS configuration is loaded
docker-compose logs bookstore_springboot_app | grep -i "cors"
```

### **Issue 2: Preflight Request Failing**
```bash
# Solution: Ensure OPTIONS method is allowed
curl -X OPTIONS http://localhost:8080/api/admin/settings -v
```

### **Issue 3: Credentials Not Allowed**
```bash
# Solution: Check allowCredentials setting
curl -X GET http://localhost:8080/api/admin/settings \
  -H "Origin: http://localhost:3000" \
  -H "Cookie: session=test" \
  -v
```

### **Issue 4: Wrong Origin**
```bash
# Solution: Verify origin is in allowed list
curl -X GET http://localhost:8080/api/admin/settings \
  -H "Origin: http://localhost:3000" \
  -v
```

## 📋 **Configuration Files Updated**

### **1. `SecurityConfig.java`**
- ✅ Enhanced CORS configuration with fallbacks
- ✅ Added comprehensive headers
- ✅ Improved preflight request handling

### **2. `GlobalCorsConfig.java`**
- ✅ Created global CORS configuration
- ✅ Implemented WebMvcConfigurer
- ✅ Added permissive settings for development

### **3. `CorsTestController.java`**
- ✅ Created test endpoints for CORS verification
- ✅ Added GET, POST, and OPTIONS methods

### **4. `application.yml`**
- ✅ Updated CORS properties
- ✅ Added wildcard origin for development

## 🎯 **Expected Behavior After Fix**

1. **Preflight requests** (OPTIONS) should return 200 with CORS headers
2. **Actual requests** (GET, POST, etc.) should include CORS headers
3. **Frontend requests** should succeed without CORS errors
4. **Browser console** should show successful API calls

## 🔍 **Debugging Steps**

### **Step 1: Check Backend Logs**
```bash
docker-compose logs bookstore_springboot_app | grep -i cors
```

### **Step 2: Test CORS Endpoint**
```bash
curl -X GET http://localhost:8080/api/cors-test/ping -v
```

### **Step 3: Check Network Tab**
1. Open browser DevTools
2. Go to Network tab
3. Make a request from frontend
4. Check if OPTIONS request is made first
5. Verify CORS headers in response

### **Step 4: Test with curl**
```bash
# Test preflight
curl -X OPTIONS http://localhost:8080/api/admin/settings \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Test actual request
curl -X GET http://localhost:8080/api/admin/settings \
  -H "Origin: http://localhost:3000" \
  -v
```

## 🆘 **If Issues Persist**

1. **Clear browser cache** and try again
2. **Check if backend is running** on port 8080
3. **Verify frontend is running** on port 3000
4. **Test with different browser** (Chrome, Firefox, Edge)
5. **Check firewall/antivirus** blocking requests

## 📚 **Additional Resources**

- [Spring CORS Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-cors)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Browser CORS Debugging](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#preflight_requests)

The CORS issue should now be resolved! 🎉
