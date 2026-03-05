const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

console.log('Testing AWS Credentials...');
console.log('Access Key ID:', process.env.AWS_ACCESS_KEY_ID ? 'Exists (Length: ' + process.env.AWS_ACCESS_KEY_ID.length + ')' : 'Missing');
console.log('Secret Access Key:', process.env.AWS_SECRET_ACCESS_KEY ? 'Exists (Length: ' + process.env.AWS_SECRET_ACCESS_KEY.length + ')' : 'Missing');
console.log('Region:', process.env.AWS_REGION);

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function testAuth() {
    try {
        const command = new ListBucketsCommand({});
        const response = await s3.send(command);
        console.log('Authentication successful. Buckets accessible:', response.Buckets ? response.Buckets.length : '0');
    } catch (error) {
        console.error('\nAuthentication test failed:');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.Code) console.error('AWS Error Code:', error.Code);
    }
}

testAuth();
