#!/bin/bash

# Navigate to script directory
cd "$(dirname "$0")"

echo "Building Python Backend Executable..."

# Ensure dependencies are installed
pip3 install -r requirements.txt

# Run PyInstaller
# --onefile: Create a single executable
# --name: Name of the output file
# --clean: Clean PyInstaller cache
pyinstaller --onefile --name deep-scribe-backend --clean main.py

echo "Build complete. Executable is in python_backend/dist/deep-scribe-backend"
