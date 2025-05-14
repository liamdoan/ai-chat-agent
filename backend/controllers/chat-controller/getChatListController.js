const userChatsModel = require("../../database/models/userChatsModel");

// get all chats in ChatList
module.exports.getChatList = async (req, res) => {
    const userId = "12345";

     try {
        const userChats = await userChatsModel.find({
            userId: userId
        })

        // avoid return error
        if (!userChats || !userChats.length) {
            return res.status(200).send([])
        };

        res.status(200).send(userChats[0].chats)
     } catch (error) {
        console.error(error);
        res.status(500).send("Can't fetch all chats.")
     }
};
