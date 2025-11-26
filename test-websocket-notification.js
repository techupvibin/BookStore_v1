// Test script to send a direct WebSocket notification
const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

async function testDirectNotification() {
  console.log('🧪 Testing Direct WebSocket Notification...\n');

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

    // Step 2: Get user info to find a user ID
    console.log('\n2️⃣ Getting user information...');
    const userResponse = await axios.get(`${BASE_URL}/auth/validate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ User info:', userResponse.data);

    // Step 3: Send a test notification directly via the notification service
    console.log('\n3️⃣ Testing direct notification...');
    
    // We'll use the admin's user ID for testing
    const adminUserId = userResponse.data.userId;
    console.log(`Testing notification for user ID: ${adminUserId}`);

    // Since we can't directly call the notification service, let's check if there are any orders
    // and update one to trigger the notification
    const ordersResponse = await axios.get(`${BASE_URL}/admin/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const orders = ordersResponse.data;
    console.log(`Found ${orders.length} orders`);

    if (orders.length > 0) {
      const testOrder = orders[0];
      console.log(`\n4️⃣ Updating order ${testOrder.id} status...`);
      console.log(`Order user ID: ${testOrder.user?.userId}`);
      console.log(`Current status: ${testOrder.orderStatus}`);

      // Update the order status to trigger notification
      const newStatus = testOrder.orderStatus === 'NEW_ORDER' ? 'PROCESSING' : 'NEW_ORDER';
      
      const updateResponse = await axios.put(`${BASE_URL}/admin/orders/${testOrder.id}/status`, 
        { newStatus: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      console.log(`✅ Order status updated to: ${updateResponse.data.orderStatus}`);
      console.log('📢 Check the frontend notification bell for the notification!');
      
      // Wait a moment for the notification to be processed
      console.log('\n⏳ Waiting 3 seconds for notification processing...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('\n✅ Test completed!');
      console.log('\n📝 Instructions:');
      console.log('1. Open the frontend in your browser (http://localhost:3000)');
      console.log('2. Log in as the user whose order was updated');
      console.log('3. Check the notification bell in the top navigation');
      console.log('4. You should see a notification about the order status update');
      
    } else {
      console.log('❌ No orders found to test with');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

async function runTest() {
  console.log('🚀 Starting WebSocket Notification Test...\n');
  await testDirectNotification();
}

runTest().catch(console.error);
