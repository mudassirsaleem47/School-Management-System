const bcrypt = require('bcryptjs');

// Test password hashing
const testPassword = 'test123';

async function testPasswordHash() {
    console.log('=== Password Hash Test ===\n');
    
    // Create a new hash
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('Test Password:', testPassword);
    console.log('New Hash:', newHash);
    
    // Test comparison
    const isValid = await bcrypt.compare(testPassword, newHash);
    console.log('Password matches new hash:', isValid);
    
    // Test with database hash (from screenshot)
    const dbHash = '$2b$16$PrL9Oku80DA4KxR8Zwt/GelMZZ6XPQexzapnXFNJ6vp1O5EBff1OQ';
    console.log('\n=== Database Hash Test ===');
    console.log('DB Hash:', dbHash);
    
    // Try common passwords
    const commonPasswords = ['test123', 'hamza123', 'password', '123456', 'teacher123'];
    
    for (const pwd of commonPasswords) {
        const match = await bcrypt.compare(pwd, dbHash);
        console.log(`Password "${pwd}" matches:`, match);
    }
}

testPasswordHash().catch(console.error);
