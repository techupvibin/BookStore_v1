const { Kafka } = require('kafkajs');

// Test Kafka connectivity in Docker environment
async function testKafkaConnectivity() {
    console.log('🔍 Testing Kafka connectivity in Docker...');
    
    const kafka = new Kafka({
        clientId: 'bookstore-test-client',
        brokers: ['localhost:9092'], // External port for testing
        retry: {
            initialRetryTime: 100,
            retries: 8
        }
    });

    const producer = kafka.producer();
    const consumer = kafka.consumer({ groupId: 'test-group' });

    try {
        console.log('📡 Connecting to Kafka...');
        
        // Test producer connection
        await producer.connect();
        console.log('✅ Producer connected successfully');
        
        // Test consumer connection
        await consumer.connect();
        console.log('✅ Consumer connected successfully');
        
        // Test topic creation and message sending
        const topicName = 'test-topic-' + Date.now();
        console.log(`📝 Testing with topic: ${topicName}`);
        
        // Send a test message
        await producer.send({
            topic: topicName,
            messages: [
                { 
                    key: 'test-key', 
                    value: JSON.stringify({
                        message: 'Hello Kafka from BookStore!',
                        timestamp: new Date().toISOString()
                    })
                }
            ]
        });
        console.log('✅ Test message sent successfully');
        
        // Subscribe to the topic
        await consumer.subscribe({ topic: topicName, fromBeginning: true });
        
        // Consume the message
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log('📨 Received message:', {
                    topic,
                    partition,
                    key: message.key.toString(),
                    value: message.value.toString()
                });
            }
        });
        
        // Wait a bit for message consumption
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🎉 Kafka connectivity test completed successfully!');
        
    } catch (error) {
        console.error('❌ Kafka connectivity test failed:', error.message);
        console.error('Full error:', error);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Troubleshooting tips:');
            console.log('1. Make sure Docker is running');
            console.log('2. Start containers with: docker-compose up -d');
            console.log('3. Wait for Kafka to be healthy');
            console.log('4. Check Kafka logs: docker-compose logs kafka');
        }
    } finally {
        // Cleanup
        try {
            await producer.disconnect();
            await consumer.disconnect();
            console.log('🔌 Disconnected from Kafka');
        } catch (error) {
            console.log('⚠️ Error during disconnect:', error.message);
        }
    }
}

// Run the test
testKafkaConnectivity().catch(console.error);
