import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chatRouter.js';
import ingestRouter from './routes/ingestRouter.js';
import './config/db.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRouter);
app.use('/api/ingest', ingestRouter);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Chatbot Express server running on http://localhost:${PORT}`);
});