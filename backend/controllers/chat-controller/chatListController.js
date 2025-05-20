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

// delete a chat thread in ChatList
module.exports.deleteChatThread = async (req, res) => {
    const userId = "12345";
    const chatId = req.params.id;

    try {
        // find user's chat document,
        // update by pulling the chat with matching _id
        const userChatsDocument = await userChatsModel.findOneAndUpdate(
            { userId: userId },
            { $pull: 
                { chats: 
                    { _id: chatId } 
                }
            },
            { new: true } // return updated document
        );

        if (!userChatsDocument) {
            return res.status(404).send("User chat document not found.");
        }

        // check if thread was successfully removed
        const chatThreadExists = userChatsDocument.chats.some(chat => chat._id === chatId);
        if (!chatThreadExists) {
            return res.status(200).send("Chat thread has been deleted.");
        }

        res.status(200).send("Chat thread deleted ok!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Can't delete chat thread.")
    }
}
