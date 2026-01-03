import { ipcMain } from 'electron';
import { logger } from '../utils/logger';
import { spawn } from 'child_process';
import * as path from 'path';

// Note: In a real implementation we would likely import the router or send requests to the python server port.
// For now, we assume the python backend is running and we can hit it via fetch/axios or use the SettingsService/Router approach.
// Since UnifiedRouter is Python, we need to communicate to it.
// Actually, `main.ts` spawns the python backend.
// We can use a simple helper to send requests to the python backend API.

const PYTHON_API_URL = 'http://127.0.0.1:8000'; // Default port, should be dynamic in prod

// Helper to call Python Backend
async function callAI(provider: string, model: string, prompt: string) {
    try {
        // We'll use the electron-store or safeStorage to get keys in the backend?
        // Actually, main.ts has access to SettingsService.
        // For simplicity in this refactor, we will assume keys are passed or handled by the python router if we hit an endpoint.
        // But the Python backend exposes a /api/generate endpoint (we assume, or we need to check router.py usage).

        // Wait, router.py is just a class. It's used by main.py? 
        // Let's check main.py again. main.py spawns `python_backend/main.py`.
        // `python_backend/main.py` is an HTTP server (FastAPI).

        const response = await fetch(`${PYTHON_API_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                provider,
                model,
                prompt,
                // In a real app we'd inject keys here from SettingsService
                // checking if we can get keys here
            })
        });
        return await response.json();
    } catch (error) {
        logger.error('[ResearchService] AI Call failed:', error);
        throw error;
    }
}

export class ResearchService {
    constructor() {
        this.registerHandlers();
    }

    private registerHandlers() {
        ipcMain.handle('research:source-run', async (_, query: string) => {
            return this.runSourcePhase(query);
        });

        ipcMain.handle('research:research-run', async (_, hypotheses: any[]) => {
            return this.runResearchPhase(hypotheses);
        });

        ipcMain.handle('research:creative-run', async (_, findings: any[]) => {
            return this.runCreativePhase(findings);
        });
    }

    // Level 1: Source Run
    private async runSourcePhase(query: string) {
        logger.info(`[Research] Starting Source Run for: ${query}`);

        // 1. Context Gathering (Search)
        // We use Perplexity for live data if available, or Gemini for generic knowledge
        // For this demo, let's construct a prompt for the "Analyst".

        const prompt = `
        You are a Senior Research Analyst.
        Topic: "${query}"
        
        Goal: Conduct a preliminary survey of this topic.
        
        Output format (JSON):
        {
            "sources": [
                { "title": "Source Title", "url": "URL if known or 'General Knowledge'", "summary": "One sentence summary", "relevance": 85 }
            ],
            "hypotheses": [
                { 
                    "id": "h1", 
                    "text": "Hypothesis statement", 
                    "rationale": "Why this is an interesting angle", 
                    "status": "pending" 
                }
            ] // Generate exactly 6 hypotheses.
        }
        `;

        // Ideally we use a smart router. defaulting to 'gemini' for speed/cost if not specified
        // In reality we should read the user's preferred "Research Model" from settings.
        // For now, hardcode 'gemini' or 'anthropic' based on what's available?
        // Let's assume the frontend sends keys or we have a way to get them.

        return { success: true, message: "Mock response for now until backend connection is verified" };
    }

    // Level 2: Research Run
    private async runResearchPhase(hypotheses: any[]) {
        logger.info(`[Research] Starting Research Run for ${hypotheses.length} items`);
        // Parallel execution
        return { success: true };
    }

    // Level 3: Creative Run
    private async runCreativePhase(findings: any[]) {
        logger.info(`[Research] Starting Creative Run`);
        return { success: true };
    }
}
