// Simple test to verify S3 connection
const AWS = require('aws-sdk');

// Configure AWS
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your-aws-access-key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your-aws-secret-key',
    region: process.env.AWS_REGION || 'eu-north-1'
});

// Test S3 connection
async function testS3Connection() {
    try {
        console.log('Testing S3 connection...');
        
        // List buckets to test connection
        const result = await s3.listBuckets().promise();
        console.log('✅ S3 connection successful!');
        console.log('Available buckets:', result.Buckets.map(b => b.Name));
        
        // Check if our bucket exists
        const bucketName = 'bookstoreimagesbkt';
        const bucketExists = result.Buckets.some(b => b.Name === bucketName);
        
        if (bucketExists) {
            console.log(`✅ Bucket '${bucketName}' exists!`);
        } else {
            console.log(`❌ Bucket '${bucketName}' not found!`);
        }
        
    } catch (error) {
        console.error('❌ S3 connection failed:', error.message);
    }
}

testS3Connection();
