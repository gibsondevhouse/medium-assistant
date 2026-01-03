import pytest
from main import app
from fastapi.testclient import TestClient
import os
import shutil

# Use a test-specific directory for ChromaDB
TEST_KB_DIR = "./test_kb_data"

@pytest.fixture(scope="session", autouse=True)
def cleanup_kb():
    """Setup and teardown for the test knowledge base"""
    # Teardown: Remove test data if it exists
    if os.path.exists(TEST_KB_DIR):
        shutil.rmtree(TEST_KB_DIR)
    
    yield
    
    # Cleanup after tests
    if os.path.exists(TEST_KB_DIR):
        shutil.rmtree(TEST_KB_DIR)

@pytest.fixture
def client():
    """Create a TestClient for the FastAPI app"""
    with TestClient(app) as c:
        yield c

@pytest.fixture
def mock_gemini_api_key():
    return "test-api-key"
