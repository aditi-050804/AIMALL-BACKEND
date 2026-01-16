import express from 'express';
import { NODE_ENV } from './config/env.js';
import errorMiddleware from './middlewares/error.middleware.js';
import chatRoutes from './routes/chat.routes.js';
import knowledgeRoutes from './routes/knowledge.routes.js';

const app = express();

// Middleware - Main app handles cors/json/urlencoded
// specific middleware for this module can remain if needed, but avoiding duplicates

// Routes
// Mounted at /api/aibase in main server
app.get('/', (req, res) => {
    res.json({ success: true, message: 'AIBASE Module API is running' });
});

app.use('/chat', chatRoutes);
app.use('/knowledge', knowledgeRoutes);

// 404 Handler for AIBASE Module
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found in AIBASE Module` });
});

// Error Handling
app.use(errorMiddleware);

export default app;
