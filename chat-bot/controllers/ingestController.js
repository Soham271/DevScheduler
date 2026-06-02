import { ingestWebsite } from '../services/scraperService.js';

export const handleIngest = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`Starting ingestion for: ${url}`);
        await ingestWebsite(url);
        res.json({ message: `Successfully completed ingestion process for ${url}` });
    } catch (error) {
        console.error("Ingestion API Error:", error);
        res.status(500).json({ error: 'Failed to ingest website.' });
    }
};
