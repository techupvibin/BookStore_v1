// Debug script to identify the login issue
const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function testAuthEndpoint() {
  console.log('🔍 Testing Auth Endpoint...\n');

  try {
    const response = await axios.get(`${BASE_URL}/api/auth/test`);
    console.log('✅ Auth endpoint is accessible');
    console.log('📝 Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Auth endpoint failed:', error.message);
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📝 Data:', error.response.data);
    }
  }
}

async function testLoginWithDebug() {
  console.log('\n🔐 Testing Login with Debug Info...\n');

  try {
    console.log('📤 Sending login request...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login successful!');
    console.log('📊 Status:', response.status);
    console.log('📝 Headers:', response.headers);
    console.log('📝 Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Login failed:', error.message);
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📝 Headers:', error.response.headers);
      console.log('📝 Data:', error.response.data);
    } else if (error.request) {
      console.log('📝 Request was made but no response received');
      console.log('📝 Request:', error.request);
    } else {
      console.log('📝 Error setting up request:', error.message);
    }
  }
}

async function testLoginWithWrongCredentials() {
  console.log('\n🔐 Testing Login with Wrong Credentials...\n');

  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'wronguser',
      password: 'wrongpass'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login response received (unexpected)');
    console.log('📊 Status:', response.status);
    console.log('📝 Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Login failed as expected');
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📝 Headers:', error.response.headers);
      console.log('📝 Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function testServerHealth() {
  console.log('🏥 Testing Server Health...\n');

  try {
    const response = await axios.get(`${BASE_URL}/actuator/health`);
    console.log('✅ Server is healthy');
    console.log('📝 Health:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Server health check failed:', error.message);
  }
}

async function runDebugTests() {
  console.log('🚀 Starting Login Debug Tests...\n');
  
  await testServerHealth();
  await testAuthEndpoint();
  await testLoginWithDebug();
  await testLoginWithWrongCredentials();
  
  console.log('\n✨ Debug tests completed!');
}

// Run the tests
runDebugTests().catch(console.error);




