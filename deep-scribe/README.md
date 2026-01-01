# Deep Scribe

A desktop assistant for authors to write Markdown files locally and publish them as Drafts to Medium.

## Architecture

This application uses the Python sidecar pattern.
- **Frontend (UI):** Electron + Vite + React + TypeScript, styled with Tailwind CSS.
- **Backend (Logic):** Python with FastAPI.
- **Communication:**
  - On launch, Electron spawns the Python process as a subprocess.
  - The Python process starts a localhost server (Uvicorn) on a dynamically assigned free port.
  - Electron communicates with Python via HTTP requests (REST API).

## How to Run

1.  **Install Dependencies:**
    - **Node.js:** Make sure you have Node.js and npm installed.
    - **Python:** Make sure you have Python 3 installed.

2.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd deep-scribe
    ```

3.  **Install Node.js Dependencies:**
    ```bash
    npm install
    ```

4.  **Install Python Dependencies:**
    It is recommended to use a virtual environment.
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    pip install -r python_backend/requirements.txt
    ```

5.  **Run the Application in Development Mode:**
    This will start the Vite dev server for the frontend and the Electron app. The Electron app will spawn the Python backend.
    ```bash
    npm run dev
    ```
    
    The script `npm run dev` will execute the command: 
    
    `concurrently "npm:dev:vite" "npm:dev:electron"`
    
    which will first build the electron project with `tsc -p electron` and then it will wait on the vite server to be up and running on port `3000` to finally start electron with `electron .`

## Building for Production

To create a production build of the application, run:
```bash
npm run build
```
This will create a `dist` folder with the packaged application.

```