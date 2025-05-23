const { default: mongoose } = require("mongoose")

let isConnected = false;

const connectMongo = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 60000, // increase timeout to 60 seconds
            socketTimeoutMS: 60000, // increase socket timeout
            connectTimeoutMS: 60000, // increase connection timeout
            maxPoolSize: 10
        });
        isConnected = true;
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Fail to connect to MongoDB", error.message);
        throw error; // Don't exit process, just throw error
    }
}

module.exports = connectMongo;
