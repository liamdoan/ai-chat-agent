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


// update a chat thread title
module.exports.updateChatThreadTitle = async (req, res) => {
    const userId = "12345"; //get user from login later when integrating with Auth model
    const chatId = req.params.id;
    const {title} = req.body;

    if (!chatId) {
        return res.status(400).send("Chat ID is required");
    }

    if (!title || title.trim().length === 0) {
        return res.status(400).send("Title cannot be empty");
    }

    if (title.trim().length > 40) {
        return res.status(400).send("Title is too long, required less than 40 characters.");
    }

    try {
        // this is nested objects, there for we need 
        // extra steps to update the document

        // update only the title
        const updateResult = await userChatsModel.updateOne(
            { userId, "chats._id": chatId },
            { $set: { "chats.$.title": title.trim() } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).send("Chat not found");
        }

        // find the updated chat thread to return updated title
        const updatedChat = await userChatsModel.findOne(
            { userId, "chats._id": chatId },
            { "chats.$": 1 }
        );

        if (!updatedChat) {
            return res.status(404).send("Chat not found");
        }

        res.status(200).send(updatedChat.chats[0]);
    } catch (error) {
        console.error(error);
        res.send(500).send("Failed to update chat title", error);
    }
};

// updateOne this doesn't return data object, it returns update result like this:
// {
//     acknowledged: true,
//     modifiedCount: 1,
//     upsertedId: null,
//     upsertedCount: 0,
//     matchedCount: 1
// }