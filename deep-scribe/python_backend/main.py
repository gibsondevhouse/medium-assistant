from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import socket
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from router import UnifiedRouter
import uvicorn

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

import torch
import sys

# ... (Previous imports kept by user context, I will just rewrite the file content efficiently if I can or use chunks)
# Actually, I'll just rewrite the file imports and add the function, it's small enough.
# Wait, let's use replace_file_content on specific chunks.

@app.get("/")
def read_root():
    return {"message": "Hello from Deep Scribe Backend"}

# --- ROUTER INTEGRATION ---
router = UnifiedRouter()

class GenerateRequest(BaseModel):
    provider: str
    model: str
    prompt: str
    api_keys: dict

@app.post("/api/generate")
async def generate_content(request: GenerateRequest):
    result = router.route_request(
        provider=request.provider,
        model=request.model,
        prompt=request.prompt,
        api_keys=request.api_keys
    )
    return result

def get_hardware_config():
    config = {
        "device": "cpu",
        "type": "Standard CPU",
        "gpu_count": 0,
        "gpu_names": []
    }

    # 1. Check for NVIDIA CUDA (The Industry Standard)
    if torch.cuda.is_available():
        config["device"] = "cuda"
        config["type"] = "NVIDIA CUDA"
        config["gpu_count"] = torch.cuda.device_count()
        # Collect names of all available cards (e.g., 'NVIDIA GeForce RTX 4090')
        for i in range(config["gpu_count"]):
            config["gpu_names"].append(torch.cuda.get_device_name(i))

    # 2. Check for Apple Silicon (M1/M2/M3 chips)
    elif torch.backends.mps.is_available():
        config["device"] = "mps"
        config["type"] = "Apple Silicon (Metal)"
        config["gpu_count"] = 1 # Integrated memory
        config["gpu_names"] = ["Apple Neural Engine"]

    return config

@app.get("/config")
def get_config():
    hw_info = get_hardware_config()
    
    # "Switchboard" Logic
    # Defaults to 'gemini' if no GPU, 'ollama' if GPU is present.
    # Frontend can override this if user manually selected a provider.
    suggested_provider = "ollama" if hw_info["gpu_count"] > 0 else "gemini"
    
    return {
        "hardware": hw_info,
        "suggested_provider": suggested_provider
    }

if __name__ == "__main__":
    port = os.getenv("PORT")
    if port is None:
        port = find_free_port()
        with open("../.env", "w") as f:
            f.write(f"PORT={port}")
    
    print(f"Starting backend server on port {port}")
    uvicorn.run(app, host="127.0.0.1", port=int(port))
