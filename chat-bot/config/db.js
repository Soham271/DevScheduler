import OpenAI from 'openai';
import { configDotenv } from 'dotenv';
import { ChromaClient } from 'chromadb';
import { DefaultEmbeddingFunction } from '@chroma-core/default-embed';

configDotenv({ path: '.env' });

const apiKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;
const isGoogle = apiKey && apiKey.startsWith("AIzaSy");

export const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: isGoogle
        ? "https://generativelanguage.googleapis.com/v1beta/openai/"
        : "https://openrouter.ai/api/v1",
});

export const chromaClient = new ChromaClient({ 
    host: process.env.CHROMA_HOST || 'localhost', 
    port: parseInt(process.env.CHROMA_PORT || '8000') 
});
await chromaClient.heartbeat();
console.log('✅ ChromaDB Connected');

const COLLECTION_NAME = 'devscheduler_data';
export const embedder = new DefaultEmbeddingFunction();

export const collection = await chromaClient.getOrCreateCollection({
    name: COLLECTION_NAME,
    embeddingFunction: embedder,
});
console.log('✅ Clean Collection Ready');

export { isGoogle };
