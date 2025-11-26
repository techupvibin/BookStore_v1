// Test script to verify login functionality after fixes
const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function testLogin() {
  console.log('🔐 Testing Login Functionality...\n');

  try {
    // Test with default admin credentials
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    console.log('✅ Login successful!');
    console.log('📝 Response status:', loginResponse.status);
    console.log('📝 Response data:', JSON.stringify(loginResponse.data, null, 2));
    
    if (loginResponse.data.token) {
      console.log('🎫 JWT Token received successfully');
      
      // Test token validation
      try {
        const validateResponse = await axios.get(`${BASE_URL}/api/auth/validate`, {
          headers: { Authorization: `Bearer ${loginResponse.data.token}` }
        });
        console.log('✅ Token validation successful!');
        console.log('📝 User data:', JSON.stringify(validateResponse.data, null, 2));
      } catch (validateError) {
        console.log('❌ Token validation failed:', validateError.response?.data || validateError.message);
      }
    }

  } catch (error) {
    console.log('❌ Login failed:', error.message);
    if (error.response) {
      console.log('📊 Response status:', error.response.status);
      console.log('📝 Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function testAdminSettings() {
  console.log('\n⚙️ Testing Admin Settings Endpoint...\n');

  try {
    // First login to get token
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('🎫 Got token, testing admin settings...');

    // Test admin settings endpoint
    const settingsResponse = await axios.get(`${BASE_URL}/api/admin/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Admin settings retrieved successfully!');
    console.log('📝 Settings:', JSON.stringify(settingsResponse.data, null, 2));

  } catch (error) {
    console.log('❌ Admin settings test failed:', error.message);
    if (error.response) {
      console.log('📊 Response status:', error.response.status);
      console.log('📝 Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function runTests() {
  console.log('🚀 Starting BookStore Login Tests...\n');
  
  await testLogin();
  await testAdminSettings();
  
  console.log('\n✨ Tests completed!');
}

// Run the tests
runTests().catch(console.error);
