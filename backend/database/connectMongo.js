const { default: mongoose } = require("mongoose")

const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Fail to connect to MongoDB", error.message);
        process.exit(1);
    }
}

module.exports = connectMongo;
