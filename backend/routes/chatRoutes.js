const express = require("express");
const { getChatList, deleteChatThread, updateChatThreadTitle } = require("../controllers/chat-controller/chatListController");
const { createNewChatThread, getContentOfSingleChat, sendMessagesToCurrentChat, uploadImageToChat } = require("../controllers/chat-controller/singleChatThreadController");
const router = express.Router();

router.get("/chats", getChatList);
router.post("/chats", createNewChatThread);
router.get("/chats/:id", getContentOfSingleChat);
router.put("/chats/:id", sendMessagesToCurrentChat);
router.put("/chats/:id/title", updateChatThreadTitle);
router.delete("/chats/:id", deleteChatThread);

router.get("/upload", uploadImageToChat);

module.exports = router;
