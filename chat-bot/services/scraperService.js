import puppeteer from 'puppeteer';
import { upstashIndex, embedder } from '../config/db.js';

const visitedUrls = new Set();

export async function fetchData(url = '') {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    const result = await page.evaluate(() => {
        const headerText = document.head ? document.head.innerText : '';
        const bodyText = document.body ? document.body.innerText : '';

        const internalLinks = [];
        const anchors = document.querySelectorAll('a');
        anchors.forEach(a => {
            const link = a.getAttribute('href');
            if (!link || link === '/') return;
            if (link.startsWith('http')) return;
            internalLinks.push(link);
        });

        return {
            header: headerText,
            body: bodyText,
            internalLinks
        };
    });

    await browser.close();
    return result;
}

export function chunkTextByTokens(text, maxTokens = 200) {
    const tokens = text.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < tokens.length; i += maxTokens) {
        chunks.push(tokens.slice(i, i + maxTokens).join(' '));
    }
    return chunks;
}

export async function storeInUpstash({ url, body }) {
    const vector = (await embedder.generate([body]))[0];
    await upstashIndex.upsert({
        id: `${url}-${Date.now()}-${Math.random()}`,
        vector: vector,
        metadata: { url, body },
    });
}

export async function ingestWebsite(url = '') {
    try {
        if (visitedUrls.has(url)) return;
        visitedUrls.add(url);
        console.log(`🔃 Crawling: ${url}`);

        const { header, body, internalLinks } = await fetchData(url);
        const chunks = chunkTextByTokens(`${header} ${body}`, 200);

        for (const chunk of chunks) {
            if (!chunk.trim()) continue;
            await storeInUpstash({ url, body: chunk });
        }

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
