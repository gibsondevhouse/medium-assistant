import requests
import os
from typing import List, Dict, Any, Optional
from utils.logger import logger

class GoogleSearchService:
    """
    Service for interacting with the Google Custom Search JSON API.
    Provides "Grounded" research capabilities by fetching live web results.
    """
    
    BASE_URL = "https://www.googleapis.com/customsearch/v1"

    def __init__(self):
        self._api_key = None
        self._cx = None

    def configure(self, api_key: str, cx: str):
        """Update configuration with user-provided keys"""
        self._api_key = api_key
        self._cx = cx

    def search(self, query: str, num_results: int = 5, **kwargs) -> Dict[str, Any]:
        """
        Perform a Google Search.

        Args:
            query: The search term.
            num_results: Number of results to return (max 10).
            **kwargs: Additional parameters for the API.

        Returns:
            Dict containing success status and list of results (title, link, snippet).
        """
        if not self._api_key or not self._cx:
            return {
                "success": False,
                "error": "Google Search API Key or Search Engine ID (CX) not configured."
            }

        try:
            params = {
                "key": self._api_key,
                "cx": self._cx,
                "q": query,
                "num": min(num_results, 10)  # API max is 10
            }
            params.update(kwargs)

            logger.info(f"Executing Google Search: {query}")
            response = requests.get(self.BASE_URL, params=params, timeout=10)
            
            if response.status_code != 200:
                logger.error(f"Google Search API Error: {response.status_code} - {response.text}")
                return {
                    "success": False, 
                    "error": f"API Error: {response.status_code}",
                    "details": response.text
                }

            data = response.json()
            
            # Extract relevant fields
            results = []
            if "items" in data:
                for item in data["items"]:
                    results.append({
                        "title": item.get("title"),
                        "link": item.get("link"),
                        "snippet": item.get("snippet"),
                        "source": item.get("displayLink")
                    })

            return {
                "success": True,
                "results": results,
                "search_time": data.get("searchInformation", {}).get("searchTime"),
                "total_results": data.get("searchInformation", {}).get("totalResults")
            }

        except Exception as e:
            logger.error(f"Google Search Exception: {str(e)}")
            return {"success": False, "error": str(e)}
