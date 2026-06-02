import express from 'express';
import { handleIngest } from '../controllers/ingestController.js';

const router = express.Router();

router.post('/', handleIngest);

export default router;
