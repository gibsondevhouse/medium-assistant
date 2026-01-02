
import { spawn, exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export class GeminiCLIService {
    private cliCommand = 'gemini'; // Assuming 'gemini' is in PATH after install

    constructor() { }

    async isInstalled(): Promise<boolean> {
        return new Promise((resolve) => {
            exec(`${this.cliCommand} --version`, (error) => {
                resolve(!error);
            });
        });
    }

    async install(): Promise<void> {
        return new Promise((resolve, reject) => {
            exec('npm install -g @google-labs/gemini-cli', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Install error: ${error.message}`);
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }

    isAuthenticated(): boolean {
        const homedir = os.homedir();
        let configPath = '';

        if (process.platform === 'win32') {
            configPath = path.join(process.env.APPDATA || '', 'gemini-cli');
        } else {
            configPath = path.join(homedir, '.config', 'gemini-cli');
        }

        // Check for tokens.json or similar credential file. 
        // Based on standard OAuth flows, we look for a credential file.
        // The previous request mentioned checking this specific directory.
        // We will check if the directory exists and has files.
        if (!fs.existsSync(configPath)) {
            return false;
        }

        // Naive check: if directory exists and is not empty, assume tokens might be there.
        // A more robust check might be needed if we knew the exact filename (e.g., credentials.json)
        try {
            const files = fs.readdirSync(configPath);
            return files.length > 0;
        } catch (e) {
            return false;
        }
    }

    async login(onLog?: (message: string) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            const child = spawn(this.cliCommand, ['auth', 'login'], {
                // Use pipe to capture output. 'ignore' for stdin might be risky if it waits for input,
                // but 'inherit' caused the issue. We'll try to capture output.
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: true
            });

            if (onLog) {
                child.stdout?.on('data', (data) => onLog(data.toString()));
                child.stderr?.on('data', (data) => onLog(data.toString()));
            }

            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Login failed with code ${code}`));
                }
            });

            child.on('error', (err) => {
                reject(err);
            });
        });
    }

    async generateContent(prompt: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // Usage: gemini prompt "message" 
            // Verify actual arguments for @google-labs/gemini-cli. 
            // Assuming `prompt` command based on standard CLI designs.
            const child = spawn(this.cliCommand, ['prompt', prompt], {
                shell: true
            });

            let output = '';
            let errorOutput = '';

            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve(output.trim());
                } else {
                    console.error('Gemini CLI Error:', errorOutput);
                    reject(new Error(`Gemini CLI exited with code ${code}: ${errorOutput}`));
                }
            });
        });
    }
}
