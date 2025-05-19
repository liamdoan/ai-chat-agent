const ImageKit = require("imagekit");
const chatModel = require("../../database/models/chatModel");
const userChatsModel = require("../../database/models/userChatsModel");

// get content of single chat convo in ChatPage
module.exports.getContentOfSingleChat = async (req, res) => {
    const userId = "12345";
    const chatId = req.params.id

     try {
        const chat = await chatModel.findOne({
            _id: chatId,
            userId: userId
        })

        res.status(200).send(chat)
     } catch (error) {
        console.error(error);
        res.status(500).send("Can't fetch chat in this thread.")
     }
};

// create a new chat thread from DashboardPage
module.exports.createNewChatThread = async (req, res) => {
    const {userId, text, img} = req.body
    console.log({ text, img })

    try {
        const newChat = new chatModel({
            userId: userId,
            history: [{
                role: "user",
                parts: [{
                    text: text
                }],
                ...(img && { img })
            }]
        })

        const savedChats = await newChat.save();

        // check if userChats exists
        const userChats = await userChatsModel.find({userId: userId})

        if (!userChats.length) {
            const newUserChats = new userChatsModel({
                userId: userId,
                chats: [
                    {
                        _id: savedChats._id,
                        title: text.substring(0, 40),
                    }
                ]
            })

            await newUserChats.save();
            return res.status(201).json({_id: savedChats._id});
        } else {
            await userChatsModel.updateOne(
                {
                    userId: userId
                },
                {
                    $push: {
                        chats: {
                            _id: savedChats._id,
                            title: text.substring(0, 40),
                        }
                    }
                }
            )

            res.status(201).json({_id: savedChats._id});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Can't create chat.")
    }
};

// send messages to current chat in NewPrompt
module.exports.sendMessagesToCurrentChat = async (req, res) => {
    const userId = "12345";
    const chatId = req.params.id
    const {question, answer, img} = req.body;
    const newItems = [
        ...
        (question ? 
            [{
                role: "user",
                parts: [{
                    text: question
                }],
                ...(img && {img})
            }] : []
        ),
        {
            role: "model",
            parts: [{
                text: answer
            }]
        }
    ]

     try {
        const updatedChat = await chatModel.updateOne({
            _id: chatId,
            userId: userId
        }, {
            $push: {
                history: {
                    $each: newItems
                },
            }
        });

        res.status(200).send(updatedChat)
     } catch (error) {
        console.error(error);
        res.status(500).send("Can't add more chat in this thread.")
     }
}

// upload image to chat with ImageKit
const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY
});

module.exports.uploadImageToChat = async (req, res) => {
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
}
