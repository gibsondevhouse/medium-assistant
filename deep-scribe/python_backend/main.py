import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socket
from dotenv import load_dotenv
import os

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

@app.get("/")
def read_root():
    return {"message": "Hello from Deep Scribe Backend"}

if __name__ == "__main__":
    port = os.getenv("PORT")
    if port is None:
        port = find_free_port()
        with open("../.env", "w") as f:
            f.write(f"PORT={port}")
    
    print(f"Starting backend server on port {port}")
    uvicorn.run(app, host="127.0.0.1", port=int(port))
