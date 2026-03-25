require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Testing Cloudinary Connection...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

// Upload a sample image from a remote URL
cloudinary.uploader.upload('https://res.cloudinary.com/demo/image/upload/sample.jpg', 
    { public_id: "test_upload_verification" }, 
    function(error, result) {
        if (error) {
            console.error('❌ Upload Failed:', error);
            process.exit(1);
        } else {
            console.log('✅ Upload Successful!');
            console.log('Image URL:', result.secure_url);
            console.log('Public ID:', result.public_id);
            process.exit(0);
        }
    }
);
