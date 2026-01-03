import pytest
from unittest.mock import patch, MagicMock

class TestKnowledgeBase:
    
    @patch("services.google_search.requests.get")
    def test_google_search_endpoint(self, mock_get, client, mock_gemini_api_key):
        """Test the Google Search tool endpoint with mocked external API"""
        # ... (existing test code) ...
        # Mock successful Google API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "items": [
                {"title": "Test Result 1", "link": "http://test.com/1", "snippet": "Snippet 1"},
                {"title": "Test Result 2", "link": "http://test.com/2", "snippet": "Snippet 2"}
            ],
            "searchInformation": {"searchTime": 0.1, "totalResults": "100"}
        }
        mock_get.return_value = mock_response

        response = client.post(
            "/api/tools/search",
            json={
                "query": "test query",
                "api_key": "fake_search_key",
                "search_engine_id": "fake_cx"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["results"]) == 2
        assert data["results"][0]["title"] == "Test Result 1"

    @patch("services.google_books.requests.get")
    def test_google_books_endpoint(self, mock_get, client):
        """Test the Google Books tool endpoint"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "items": [
                {
                    "volumeInfo": {
                        "title": "Test Book",
                        "authors": ["Author One"],
                        "publishedDate": "2023",
                        "description": "A test book description",
                        "infoLink": "http://books.google.com/test"
                    }
                }
            ]
        }
        mock_get.return_value = mock_response

        response = client.post(
            "/api/tools/books",
            json={
                "query": "test book",
                "api_key": "fake_key"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["results"]) == 1
        assert data["results"][0]["title"] == "Test Book"
        assert data["results"][0]["authors"] == ["Author One"]

    def test_health_check(self, client):
        """Test the root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "Hello from Deep Scribe Backend (Gemini)"}

    # Note: Testing actual ChromaDB integration requires mocking the expensive 
    # embedding generation or using a lighter embedding function for tests.
    # For this V1 suite, we focus on the API layer logic.
