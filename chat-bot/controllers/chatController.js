import { chatwithdata } from '../services/aiService.js';

export const handleChat = async (req, res) => {
    try {
        const { message, userContext } = req.body;
        console.log("=== INCOMING CHAT REQUEST ===");
        console.log("Message:", message);
        console.log("UserContext:", userContext);
        console.log("=============================");
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const responseText = await chatwithdata(message, userContext);
        res.json({ response: responseText });
    } catch (error) {
        console.error("Chat API Error:", error);
        res.status(500).json({ error: 'Failed to process chat query.' });
    }
};
