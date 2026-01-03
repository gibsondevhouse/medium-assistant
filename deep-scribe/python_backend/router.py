import google.generativeai as genai

QUILL_PRICING = {
    "gemini-2.0-flash": 1,
    "gemini-2.5-flash": 1,
    "gemini-2.5-flash-lite": 1,
    "gemini-2.5-pro": 15,
    "gemini-3.0-pro-preview": 15,
}

class GeminiRouter:
    """Gemini-exclusive AI router for Deep Scribe."""

    def generate(self, model: str, prompt: str, api_key: str):
        """Generate content using Gemini API.

        Args:
            model: Gemini model name (e.g., 'gemini-2.5-flash')
            prompt: The text prompt to send
            api_key: Gemini API key

        Returns:
            Dict with success status, content, and metadata
        """
        try:
            if not api_key:
                raise ValueError("Gemini API Key missing")

            genai.configure(api_key=api_key)
            model_name = model if model else "gemini-2.5-flash"
            model_instance = genai.GenerativeModel(model_name)
            response = model_instance.generate_content(prompt)

            cost = QUILL_PRICING.get(model_name, 1)

            return {
                "success": True,
                "provider": "gemini",
                "model": model_name,
                "content": response.text,
                "quills_deducted": cost
            }

        except Exception as e:
            print(f"Gemini Router Error: {e}")
            return {"success": False, "error": str(e)}
