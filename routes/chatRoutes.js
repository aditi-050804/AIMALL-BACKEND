import mongoose from "mongoose";
import express from "express"
import ChatSession from "../models/ChatSession.js"
import { generativeModel } from "../config/gemini.js";
import userModel from "../models/User.js";
import { verifyToken } from "../middleware/authorization.js";
import { checkKillSwitch } from "../middleware/checkKillSwitch.js";





const router = express.Router();

// Apply Kill Switch to ALL chat routes (Inference)
// TEMPORARILY DISABLED - causing 503 errors
// router.use(checkKillSwitch);

// Main Chat Interaction Route (Authorized & Persistent)
router.post("/", verifyToken, async (req, res) => {
  const { content, history, systemInstruction, sessionId, title } = req.body;
  const userId = req.user.id;

  try {
    // 1. Save User Message to Database first if sessionId is provided
    let session;
    if (sessionId) {
      const userMsg = {
        role: 'user',
        content: content,
        timestamp: Date.now()
      };

      session = await ChatSession.findOneAndUpdate(
        { sessionId },
        {
          $push: { messages: userMsg },
          $set: { lastModified: Date.now(), ...(title && { title }), userId }
        },
        { new: true, upsert: true }
      );

      // Link to User if not already linked
      await userModel.findByIdAndUpdate(
        userId,
        { $addToSet: { chatSessions: session._id } }
      );
    }

    // 2. Prepare Context for AI
    let parts = [];
    if (systemInstruction) {
      parts.push({ text: `System Instruction: ${systemInstruction}` });
    }

    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        parts.push({ text: `${msg.role === 'user' ? 'User' : 'Model'}: ${msg.content}` });
      });
    }
    parts.push({ text: `User: ${content}` });

    // 3. Generate AI Response
    const contentPayload = { role: "user", parts: parts };
    const streamingResult = await generativeModel.generateContentStream({ contents: [contentPayload] });

    // We await the full response for saving (can be optimized to stream, but persistence needs full text)
    const finalResponse = await streamingResult.response;
    const reply = finalResponse.text();

    // 4. Save AI Reply to Database
    if (sessionId) {
      const aiMsg = {
        role: 'model',
        content: reply,
        timestamp: Date.now()
      };

      await ChatSession.findOneAndUpdate(
        { sessionId },
        {
          $push: { messages: aiMsg },
          $set: { lastModified: Date.now() }
        }
      );
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat Persistence Error:", err);
    return res.status(500).json({ error: "AI failed to respond", details: err.message });
  }
});
// Get all chat sessions (summary) for the authenticated user
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await ChatSession.find({ userId })
      .select('sessionId title lastModified')
      .sort({ lastModified: -1 });

    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get chat history for a specific session
router.get('/:sessionId', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Optional: Verify that the session belongs to this user
    // For now, finding by sessionId is okay as sessionIds are unique/random
    let session = await ChatSession.findOne({ sessionId });

    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Create or Update message in session
router.post('/:sessionId/message', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, title } = req.body;
    const userId = req.user.id


    if (!message?.role || !message?.content) {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    const session = await ChatSession.findOneAndUpdate(
      { sessionId },
      {
        $push: { messages: message },
        $set: { lastModified: Date.now(), ...(title && { title }), userId }
      },
      { new: true, upsert: true }
    );

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    await userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { chatSessions: session._id } },
      { new: true }
    );
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});


router.delete('/:sessionId', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await ChatSession.findOneAndDelete({ sessionId });
    if (session) {
      await userModel.findByIdAndUpdate(userId, { $pull: { chatSessions: session._id } });
    }
    res.json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
