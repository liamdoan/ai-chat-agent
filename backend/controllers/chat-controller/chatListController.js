const userChatsModel = require("../../database/models/userChatsModel");
const chatModel = require("../../database/models/chatModel");

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

// delete a chat thread in ChatList
module.exports.deleteChatThread = async (req, res) => {
    const userId = "12345";
    const chatId = req.params.id;

    try {
        // Delete from both collections, chats and userchats
        await Promise.all([
            userChatsModel.updateOne(
                { userId },
                { $pull: { chats: { _id: chatId } } }
            ),
            chatModel.deleteOne({ _id: chatId, userId })
        ]);

        res.status(200).send("Chat deleted successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to delete chat");
    }
}
