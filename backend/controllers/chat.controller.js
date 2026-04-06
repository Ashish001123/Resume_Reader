import ChatSession from "../model/chatSession.model.js";


export const createChatSession = async (req, res) => {
    try {
        const { userId, resumeText } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        const newSession = new ChatSession({
            userId,
            resumeText: resumeText || "",
            title: "New AI Resume Chat",
            messages: []
        });

        await newSession.save();
        res.status(201).json(newSession);
    } catch (error) {
        console.error("Error creating chat session: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const getUserChatSessions = async (req, res) => {
    try {
        const { userId } = req.params;

        const sessions = await ChatSession.find({ userId })
                                          .select("-resumeText -messages") // Only grab metadata for the sidebar
                                          .sort({ updatedAt: -1 });

        res.status(200).json(sessions);
    } catch (error) {
        console.error("Error fetching sessions: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getChatSessionById = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await ChatSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: "Chat session not found" });
        }

        res.status(200).json(session);
    } catch (error) {
        console.error("Error fetching session details: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const addMessageToSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { role, content } = req.body;

        // Add the new message to the array
        session.messages.push({ role, content });
        await session.save();

        res.status(200).json(session.messages);
    } catch (error) {
        console.error("Error adding message to session: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const streamMessage = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { message } = req.body;

        const session = await ChatSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: "Chat session not found" });
        }

        session.messages.push({ role: "user", content: message });
        await session.save();

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");


        const historyToSend = session.messages.slice(0, -1);
        
        const pythonResponse = await fetch("http://127.0.0.1:8000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: message,
                resume_text: session.resumeText,
                history: historyToSend
            })
        });

        if (!pythonResponse.body) {
            throw new Error("No body in Python response");
        }

        const reader = pythonResponse.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullAiResponse = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunkText = decoder.decode(value, { stream: true });
            fullAiResponse += chunkText;

            res.write(chunkText);
        }

 
        session.messages.push({ role: "assistant", content: fullAiResponse });
        await session.save();

        res.end();
    } catch (error) {
        console.error("Streaming error: ", error);
        res.status(500).end("Error generating response");
    }
}
