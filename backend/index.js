const express = require("express");
const app= express();
const dotenv = require('dotenv');
dotenv.config();
const cors = require("cors");

const PORT = process.env.PORT || 5000;
const connectMongo = require("./database/connectMongo");
const chatRoutes = require("./routes/chatRoutes");

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());

app.use("/api", chatRoutes);

app.listen(PORT, () => {
    connectMongo();
    console.log(`Server is running on port ${PORT}`)
})
