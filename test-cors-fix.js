// Test script to verify CORS fix
// Run with: node test-cors-fix.js

const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function testCorsFix() {
  console.log('🧪 Testing CORS Fix...\n');

  // Test 1: Admin settings endpoint (should work without CORS issues)
  console.log('1️⃣ Testing admin settings endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/settings`, { 
      timeout: 10000,
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    console.log('✅ Admin settings endpoint working!');
    console.log('📊 Status:', response.status);
    console.log('📝 Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('⚠️ Admin settings responded with error:');
      console.log('📊 Status:', error.response.status);
      console.log('📝 Response:', error.response.data);
    } else {
      console.log('❌ Admin settings error:', error.message);
    }
  }

  // Test 2: Registration endpoint (should work without CORS issues)
  console.log('\n2️⃣ Testing registration endpoint...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, {
      username: 'testuser',
      password: 'testpass123',
      email: 'test@example.com'
    }, { 
      timeout: 10000,
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Registration endpoint working!');
    console.log('📊 Status:', response.status);
    console.log('📝 Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('⚠️ Registration responded with error:');
      console.log('📊 Status:', error.response.status);
      console.log('📝 Response:', error.response.data);
    } else {
      console.log('❌ Registration error:', error.message);
    }
  }

  // Test 3: Books endpoint (should work without CORS issues)
  console.log('\n3️⃣ Testing books endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/api/books`, { 
      timeout: 10000,
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    console.log('✅ Books endpoint working!');
    console.log('📊 Status:', response.status);
    console.log('📝 Response count:', response.data?.content?.length || 'No content');
  } catch (error) {
    if (error.response) {
      console.log('⚠️ Books responded with error:');
      console.log('📊 Status:', error.response.status);
      console.log('📝 Response:', error.response.data);
    } else {
      console.log('❌ Books error:', error.message);
    }
  }

  console.log('\n✨ CORS test completed!');
}

// Run the test
testCorsFix().catch(console.error);
