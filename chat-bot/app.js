// ======================================================
// IMPORTS
// ======================================================
import * as cheerio from 'cheerio';
import axios from 'axios';
import OpenAI from 'openai';
import { configDotenv } from 'dotenv';
import { ChromaClient } from 'chromadb';
import { DefaultEmbeddingFunction } from '@chroma-core/default-embed';

configDotenv({ path: '.env' });

console.log(process.env.OPENROUTER_API_KEY)



// OPENAI CLIENT
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// chromaDB client
const chromaClient = new ChromaClient({ host: 'localhost', port: 8000 });
await chromaClient.heartbeat();
console.log('✅ ChromaDB Connected');

// Changed name to 'web_data_v3' so we start perfectly clean
const COLLECTION_NAME = 'web_data_v3';
const embedder = new DefaultEmbeddingFunction();

const collection = await chromaClient.getOrCreateCollection({
    name: COLLECTION_NAME,
    embeddingFunction: embedder,
});
console.log('✅ Clean Collection Ready');

const visitedUrls = new Set();
// web scraping function
async function fetchData(url = '') {
    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
    });
    const $ = cheerio.load(data);
    const internalLinks = [];

    $('a').each((index, element) => {
        const link = $(element).attr('href');
        if (!link || link === '/') return;
        if (link.startsWith('http')) return;
        internalLinks.push(link);
    });

    return {
        header: $('head').text(),
        body: $('body').text(),
        internalLinks,
    };
}

function chunkTextByTokens(text, maxTokens = 200) {
    const tokens = text.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < tokens.length; i += maxTokens) {
        chunks.push(tokens.slice(i, i + maxTokens).join(' '));
    }
    return chunks;
}

// 3. STORE DATA
async function storeInChromaDB({ url, body }) {
    await collection.add({
        ids: [`${url}-${Date.now()}-${Math.random()}`],
        documents: [body],
        metadatas: [{ url, body }],
    });
}

async function ingestWebsite(url = '') {
    try {
        if (visitedUrls.has(url)) return;
        visitedUrls.add(url);
        console.log(`🔃 Crawling: ${url}`);

        const { header, body, internalLinks } = await fetchData(url);
        const chunks = chunkTextByTokens(`${header} ${body}`, 200);

        for (const chunk of chunks) {
            if (!chunk.trim()) continue;
            await storeInChromaDB({ url, body: chunk });
        }
        // recursive crawl internal links
        for (const link of internalLinks) {
            try {
                await ingestWebsite(new URL(link, url).href);
            } catch (error) { }
        }
        console.log(`🚀 Completed: ${url}`);
    } catch (error) {
        console.log(`❌ Ingestion Error on ${url}: ${error.message}`);
    }
}

// 4. CHAT FUNCTION
async function chatwithdata(question) {
    console.log(`🔍 Searching database for: "${question}"`);

    const collectionresult = await collection.query({
        nResults: 15,
        queryTexts: [question],
    });

    const body = (collectionresult.metadatas?.[0] || []).map(e => e.body).filter(Boolean);

    if (body.length === 0) {
        console.log("No matching context found inside ChromaDB.");
        return;
    }

    console.log("🤖 Context pulled successfully. Querying Google Gemini...");

    const response = await openai.chat.completions.create({
        model: "gemini-3.5-flash",

        messages: [
            { role: "system", content: "You are a helpful assistant. Answer only from provided context." },
            { role: "user", content: `Question:\n${question}\n\nContext:\n${body.join("\n")}` }
        ],
    });

    console.log("\n--- AI Response ---");
    console.log(response.choices?.[0]?.message?.content ?? "No text returned.");
    console.log("-------------------\n");
}
// await ingestWebsite('https://www.piyushgarg.dev');

await chatwithdata('What is the Piyush Garg Latest Youtube Videos links');
console.log('🎉 ALL DONE');