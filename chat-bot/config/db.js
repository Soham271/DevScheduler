import OpenAI from 'openai';
import { configDotenv } from 'dotenv';
import { Index } from '@upstash/vector';
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

export const upstashIndex = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});
console.log('✅ Upstash Vector Initialized');

export const embedder = new DefaultEmbeddingFunction();

export { isGoogle };
