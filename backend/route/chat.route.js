import express from "express";
import { 
    createChatSession, 
    getUserChatSessions, 
    getChatSessionById, 
    addMessageToSession,
    streamMessage 
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/sessions", createChatSession);
router.get("/user/:userId", getUserChatSessions);
router.get("/sessions/:sessionId", getChatSessionById);
router.post("/sessions/:sessionId/messages", addMessageToSession);
router.post("/sessions/:sessionId/stream", streamMessage);

export default router;
