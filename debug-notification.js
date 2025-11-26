// Debug script to test notification system step by step
const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

async function debugNotificationSystem() {
  console.log('🔍 Debugging Notification System...\n');

  try {
    // Step 1: Test admin login and get user info
    console.log('1️⃣ Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Get admin user info
    console.log('\n2️⃣ Getting admin user info...');
    const userResponse = await axios.get(`${BASE_URL}/auth/validate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Admin user info:', userResponse.data);

    // Step 3: Get orders and find one with a valid user
    console.log('\n3️⃣ Fetching orders...');
    const ordersResponse = await axios.get(`${BASE_URL}/admin/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const orders = ordersResponse.data;
    console.log(`✅ Found ${orders.length} orders`);

    // Find an order with a valid user
    const orderWithUser = orders.find(order => order.user && order.user.userId);
    if (!orderWithUser) {
      console.log('❌ No orders with valid users found');
      return;
    }

    console.log(`\n4️⃣ Found order ${orderWithUser.id} with user ${orderWithUser.user.userId}`);
    console.log(`   Order status: ${orderWithUser.orderStatus}`);
    console.log(`   User details:`, orderWithUser.user);

    // Step 4: Test the order status update endpoint directly
    console.log('\n5️⃣ Testing order status update...');
    const newStatus = orderWithUser.orderStatus === 'NEW_ORDER' ? 'PROCESSING' : 'NEW_ORDER';
    
    console.log(`   Updating order ${orderWithUser.id} from ${orderWithUser.orderStatus} to ${newStatus}`);
    
    const updateResponse = await axios.put(`${BASE_URL}/admin/orders/${orderWithUser.id}/status`, 
      { newStatus: newStatus },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    console.log('✅ Order status update response:', updateResponse.data);

    // Step 5: Check if we can get user info for the order owner
    console.log('\n6️⃣ Testing user lookup for order owner...');
    try {
      // Try to get user info by ID (this might not work if there's no endpoint)
      console.log(`   Order owner user ID: ${orderWithUser.user.userId}`);
      console.log(`   Order owner username: ${orderWithUser.user.username}`);
    } catch (error) {
      console.log('   User lookup failed:', error.message);
    }

    // Step 6: Test WebSocket endpoint
    console.log('\n7️⃣ Testing WebSocket endpoint...');
    try {
      const wsResponse = await axios.get('http://localhost:8080/ws/info', {
        timeout: 5000
      });
      console.log('✅ WebSocket endpoint accessible');
    } catch (error) {
      console.log('❌ WebSocket endpoint error:', error.message);
    }

    console.log('\n📝 Debug Summary:');
    console.log(`- Admin user ID: ${userResponse.data.userId}`);
    console.log(`- Order ID: ${orderWithUser.id}`);
    console.log(`- Order owner user ID: ${orderWithUser.user.userId}`);
    console.log(`- Order status updated: ${updateResponse.data.orderStatus}`);
    console.log('\n🔍 Check backend logs for notification service calls...');

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

async function runDebug() {
  console.log('🚀 Starting Notification Debug...\n');
  await debugNotificationSystem();
}

runDebug().catch(console.error);
