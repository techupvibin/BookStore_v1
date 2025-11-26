// Test script to verify notification system
const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

async function testNotificationSystem() {
  console.log('🧪 Testing Notification System...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    if (!loginResponse.data.token) {
      throw new Error('Admin login failed');
    }

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Get all orders
    console.log('\n2️⃣ Fetching orders...');
    const ordersResponse = await axios.get(`${BASE_URL}/admin/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const orders = ordersResponse.data;
    console.log(`✅ Found ${orders.length} orders`);

    if (orders.length === 0) {
      console.log('❌ No orders found to test with');
      return;
    }

    // Step 3: Update order status
    const testOrder = orders[0];
    console.log(`\n3️⃣ Testing order status update for order ${testOrder.id}...`);
    console.log(`Current status: ${testOrder.orderStatus}`);
    console.log(`User ID: ${testOrder.user?.userId}`);

    const newStatus = testOrder.orderStatus === 'NEW_ORDER' ? 'PROCESSING' : 'NEW_ORDER';
    
    const updateResponse = await axios.put(`${BASE_URL}/admin/orders/${testOrder.id}/status`, 
      { newStatus: newStatus },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    console.log(`✅ Order status updated to: ${updateResponse.data.orderStatus}`);
    console.log('📢 Notification should have been sent to user');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test WebSocket connection
async function testWebSocketConnection() {
  console.log('\n🔌 Testing WebSocket Connection...');
  
  try {
    // Test WebSocket endpoint
    const wsResponse = await axios.get('http://localhost:8080/ws/info', {
      timeout: 5000
    });
    console.log('✅ WebSocket endpoint is accessible');
  } catch (error) {
    console.error('❌ WebSocket connection failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Notification System Tests...\n');
  
  await testWebSocketConnection();
  await testNotificationSystem();
  
  console.log('\n✅ Tests completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Check if the user received a notification in their browser');
  console.log('2. Check browser console for WebSocket connection logs');
  console.log('3. Check backend logs for notification service logs');
}

runTests().catch(console.error);
