import requests
from typing import Dict, Any, List
from utils.logger import logger

class GoogleBooksService:
    """
    Service for interacting with the Google Books API.
    """
    BASE_URL = "https://www.googleapis.com/books/v1/volumes"

    def __init__(self):
        self._api_key = None

    def configure(self, api_key: str):
        self._api_key = api_key

    def search(self, query: str, max_results: int = 5) -> Dict[str, Any]:
        if not self._api_key:
            return {"success": False, "error": "API Key not configured"}

        try:
            params = {
                "q": query,
                "maxResults": min(max_results, 10),
                "key": self._api_key,
                "printType": "books"
            }
            
            logger.info(f"Searching Google Books: {query}")
            response = requests.get(self.BASE_URL, params=params, timeout=10)
            
            if response.status_code != 200:
                return {"success": False, "error": f"API Error: {response.status_code}"}

            data = response.json()
            books = []
            
            if "items" in data:
                for item in data["items"]:
                    info = item.get("volumeInfo", {})
                    books.append({
                        "title": info.get("title"),
                        "authors": info.get("authors", []),
                        "publishedDate": info.get("publishedDate"),
                        "description": info.get("description", "")[:500] + "...",
                        "link": info.get("infoLink")
                    })

            return {"success": True, "results": books}

        except Exception as e:
            logger.error(f"Google Books Exception: {e}")
            return {"success": False, "error": str(e)}
