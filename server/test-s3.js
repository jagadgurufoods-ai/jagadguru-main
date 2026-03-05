const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function testUpload() {
    try {
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'test/test-image.txt',
            Body: 'Hello world',
            ContentType: 'text/plain',
        });

        const response = await s3.send(command);
        console.log('Upload successful:', response);
        console.log(`URL: https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/test/test-image.txt`);
    } catch (error) {
        console.error('Upload failed with message:', error.message);
        console.error('Error Code:', error.Code || error.code || error.name);
    }
}

testUpload();
