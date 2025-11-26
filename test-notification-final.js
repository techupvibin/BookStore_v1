// Final test for notification system
const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

async function testNotificationSystem() {
  console.log('🧪 Testing Notification System (Final Test)...\n');

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

    // Step 2: Get admin user info
    console.log('\n2️⃣ Getting admin user info...');
    const userResponse = await axios.get(`${BASE_URL}/auth/validate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Admin user info:', userResponse.data);

    // Step 3: Get orders
    console.log('\n3️⃣ Fetching orders...');
    const ordersResponse = await axios.get(`${BASE_URL}/admin/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const orders = ordersResponse.data;
    console.log(`✅ Found ${orders.length} orders`);

    if (orders.length === 0) {
      console.log('❌ No orders found to test with');
      return;
    }

    // Step 4: Find an order with a user
    const orderWithUser = orders.find(order => order.user && order.user.userId);
    if (!orderWithUser) {
      console.log('❌ No orders with valid users found');
      return;
    }

    console.log(`\n4️⃣ Testing with order ${orderWithUser.id}`);
    console.log(`   User ID: ${orderWithUser.user.userId}`);
    console.log(`   Current status: ${orderWithUser.orderStatus}`);

    // Step 5: Update order status
    const newStatus = orderWithUser.orderStatus === 'NEW_ORDER' ? 'PROCESSING' : 'NEW_ORDER';
    
    console.log(`\n5️⃣ Updating order status to: ${newStatus}...`);
    
    const updateResponse = await axios.put(`${BASE_URL}/admin/orders/${orderWithUser.id}/status`, 
      { newStatus: newStatus },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    console.log(`✅ Order status updated successfully!`);
    console.log(`   New status: ${updateResponse.data.orderStatus}`);
    console.log(`   User ID: ${orderWithUser.user.userId}`);

    console.log('\n📢 NOTIFICATION SENT!');
    console.log('\n📝 Next steps:');
    console.log('1. Open the frontend in your browser (http://localhost:3000)');
    console.log(`2. Log in as the user with ID: ${orderWithUser.user.userId}`);
    console.log('3. Look for the notification bell in the top navigation');
    console.log('4. You should see a notification about the order status update');
    console.log('\n🎉 The notification system is working!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

async function runTest() {
  console.log('🚀 Starting Final Notification Test...\n');
  await testNotificationSystem();
}

runTest().catch(console.error);
