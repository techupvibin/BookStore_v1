// Test script to verify admin login functionality
// Run with: node test-admin-login.js

const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function testAdminLogin() {
  console.log('🧪 Testing Admin Login Functionality...\n');

  try {
    // Test 1: Try to login with default admin credentials
    console.log('1️⃣ Testing login with default admin credentials...');
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    if (loginResponse.data.token) {
      console.log('✅ Login successful!');
      console.log('📝 Token received:', loginResponse.data.token.substring(0, 50) + '...');
      
      // Test 2: Validate the token
      console.log('\n2️⃣ Testing token validation...');
      
      const validateResponse = await axios.get(`${BASE_URL}/api/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });

      if (validateResponse.status === 200) {
        console.log('✅ Token validation successful!');
        console.log('👤 User data:', JSON.stringify(validateResponse.data, null, 2));
      }
      
    } else {
      console.log('❌ Login failed - no token received');
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    
    if (error.response) {
      console.log('📊 Response status:', error.response.status);
      console.log('📝 Response data:', error.response.data);
    }
  }
}

async function testAdminSetup() {
  console.log('\n🔧 Testing Admin Setup Endpoint...\n');

  try {
    // Test admin setup endpoint
    const setupResponse = await axios.post(`${BASE_URL}/api/admin/initial-setup`, {
      username: 'testadmin',
      password: 'testpass123',
      email: 'testadmin@example.com'
    });

    console.log('✅ Admin setup successful!');
    console.log('📝 Response:', JSON.stringify(setupResponse.data, null, 2));

  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.log('ℹ️ Admin setup rejected - admin users already exist (this is expected)');
    } else {
      console.log('❌ Admin setup failed:', error.message);
      if (error.response) {
        console.log('📊 Response status:', error.response.status);
        console.log('📝 Response data:', error.response.data);
      }
    }
  }
}

async function runTests() {
  console.log('🚀 Starting BookStore Admin Login Tests...\n');
  
  await testAdminLogin();
  await testAdminSetup();
  
  console.log('\n✨ Tests completed!');
}

// Run the tests
runTests().catch(console.error);
