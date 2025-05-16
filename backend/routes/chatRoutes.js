const express = require("express");
const { getChatList } = require("../controllers/chat-controller/getChatListController");
const { createNewChatThread, getContentOfSingleChat, sendMessagesToCurrentChat } = require("../controllers/chat-controller/singleChatThreadController");
const router = express.Router();

router.get("/chats", getChatList);
router.post("/chats", createNewChatThread);
router.get("/chats/:id", getContentOfSingleChat);
router.put("/chats/:id", sendMessagesToCurrentChat); 

module.exports = router;
