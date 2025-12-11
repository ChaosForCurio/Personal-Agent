
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

const logFile = path.resolve(process.cwd(), 'test-log.txt');
function log(msg: string) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

// Manual env loader
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            if (key && !key.startsWith('#')) {
                process.env[key] = value.replace(/^["']|["']$/g, '');
            }
        }
    });
}

async function test() {
    log("Checking API Key availability...");
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
        log("Error: GOOGLE_GEMINI_API_KEY is not set in .env");
        return;
    }
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

    // List of candidates to test
    const models = [
        'gemini-1.5-flash-001',
        'gemini-1.5-flash-002',
        'gemini-1.5-pro',
        'gemini-1.5-pro-001',
        'gemini-pro',
        'gemini-1.0-pro'
    ];

    for (const modelName of models) {
        log(`Testing model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            log(`SUCCESS: ${modelName} responded: ${result.response.text().slice(0, 50)}...`);
        } catch (e: any) {
            log(`FAILED: ${modelName} error: ${e.message.split('\n')[0]}`); // Log only first line of error
        }
    }
}

if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
test();
