const express = require("express");
const app= express();
const dotenv = require('dotenv');
dotenv.config();
const cors = require("cors");

const ImageKit = require("imagekit");
const PORT = process.env.PORT || 5000;
const connectMongo = require("./database/connectMongo");
const chatRoutes = require("./routes/chatRoutes");

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());

const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY
});

app.get("/api/upload", (req, res) => {
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
})

app.use("/api", chatRoutes);

app.listen(PORT, () => {
    connectMongo();
    console.log(`Server is running on port ${PORT}`)
})
