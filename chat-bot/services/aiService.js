import { upstashIndex, embedder, openai, isGoogle } from '../config/db.js';

export async function chatwithdata(question, userContext) {
    console.log(`🔍 Searching database for: "${question}"`);

    const queryVector = (await embedder.generate([question]))[0];
    const collectionresult = await upstashIndex.query({
        topK: 15,
        vector: queryVector,
        includeMetadata: true,
    });

    const body = collectionresult.map(e => e.metadata?.body).filter(Boolean);

    if (body.length === 0 && !userContext) {
        console.log("No matching context found inside ChromaDB and no user context.");
        return "I'm sorry, I couldn't find any relevant context in my database for your question.";
    }

    console.log("🤖 Context pulled successfully. Querying Google Gemini...");

    const systemPrompt = "You are a helpful assistant. Answer only from provided context. If personal user context is provided, you may use it to answer questions about the user." + (userContext ? `\n\n${userContext}` : "");

    const response = await openai.chat.completions.create({
        model: isGoogle ? "gemini-2.5-flash" : "google/gemini-2.5-flash",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Question:\n${question}\n\nWebsite Context:\n${body.join("\n")}` }
        ],
    });

    const answer = response.choices?.[0]?.message?.content ?? "No text returned.";
    console.log("\n--- AI Response ---");
    console.log(answer);
    console.log("-------------------\n");
    return answer;
}
