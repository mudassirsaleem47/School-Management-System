const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env vars
const envPath = path.join(__dirname, '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

console.log('--- Cloudinary Diagnostic ---');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Present' : 'MISSING');
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Present' : 'MISSING');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Present' : 'MISSING');

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ CRITICAL: Missing Cloudinary Environment Variables. Check your .env file.');
    process.exit(1);
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testUpload() {
    console.log('\n--- Attempting Test Upload ---');
    try {
        // dynamic transparent pixel
        const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
        
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: 'school_management_system_test',
            resource_type: 'image'
        });

        console.log('✅ Upload Success!');
        console.log('Public ID:', result.public_id);
        console.log('Secure URL:', result.secure_url);
        
        // Cleanup
        console.log('\n--- Cleaning Up ---');
        await cloudinary.uploader.destroy(result.public_id);
        console.log('✅ Test file deleted.');

    } catch (error) {
        console.error('❌ Upload Failed:', error);
        console.error('Details:', error.message);
    }
}

testUpload();
