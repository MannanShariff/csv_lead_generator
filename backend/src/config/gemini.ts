import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'your_gemini_api_key_here') {
  console.warn('WARNING: GEMINI_API_KEY is not configured in the environment variables. AI operations might fail.');
}

export const genAI = new GoogleGenerativeAI(apiKey || '');
