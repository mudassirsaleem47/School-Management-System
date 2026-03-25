const mongoose = require('mongoose');
require('dotenv').config();

const listCollections = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URL || "mongodb://localhost:27017/school_management";
        await mongoose.connect(mongoUrl);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
        
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`Collection: ${col.name}, Count: ${count}`);
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listCollections();
