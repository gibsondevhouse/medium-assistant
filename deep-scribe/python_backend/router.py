import google.generativeai as genai
from openai import OpenAI
from anthropic import Anthropic
import os

QUILL_PRICING = {
    "gemini-flash": 1,
    "deepseek-coder": 1,
    "claude-haiku": 3,
    "perplexity-search": 10,
    "claude-sonnet": 15,
    "gemini-pro": 15,
    "claude-opus": 60
}

class UnifiedRouter:
    def route_request(self, provider: str, model: str, prompt: str, api_keys: dict):
        response_text = ""
        cost = 0
        
        try:
            # --- GEMINI ---
            if provider == "gemini":
                api_key = api_keys.get("gemini")
                if not api_key:
                    raise ValueError("Gemini API Key missing")
                
                genai.configure(api_key=api_key)
                # Fallback model mapping if needed, or rely on frontend passing correct model string
                model_name = model if model else "gemini-pro"
                model_instance = genai.GenerativeModel(model_name)
                response = model_instance.generate_content(prompt)
                response_text = response.text
                cost = QUILL_PRICING.get(model_name, 15)

            # --- ANTHROPIC ---
            elif provider == "anthropic":
                api_key = api_keys.get("anthropic")
                if not api_key:
                    raise ValueError("Anthropic API Key missing")
                
                client = Anthropic(api_key=api_key)
                model_name = model if model else "claude-3-sonnet-20240229"
                message = client.messages.create(
                    model=model_name,
                    max_tokens=1024,
                    messages=[{"role": "user", "content": prompt}]
                )
                response_text = message.content[0].text
                cost = QUILL_PRICING.get("claude-sonnet", 15)

            # --- DEEPSEEK (via OpenAI SDK) ---
            elif provider == "deepseek":
                api_key = api_keys.get("deepseek")
                if not api_key:
                    raise ValueError("DeepSeek API Key missing")
                
                # DeepSeek uses OpenAI compatible API
                client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
                model_name = model if model else "deepseek-coder"
                response = client.chat.completions.create(
                    model=model_name,
                    messages=[{"role": "user", "content": prompt}]
                )
                response_text = response.choices[0].message.content
                cost = QUILL_PRICING.get("deepseek-coder", 1)

            # --- PERPLEXITY (via OpenAI SDK) ---
            elif provider == "perplexity":
                api_key = api_keys.get("perplexity")
                if not api_key:
                    raise ValueError("Perplexity API Key missing")
                
                # Perplexity uses OpenAI compatible API
                client = OpenAI(api_key=api_key, base_url="https://api.perplexity.ai")
                model_name = model if model else "llama-3-sonar-large-32k-online"
                response = client.chat.completions.create(
                    model=model_name,
                    messages=[{"role": "user", "content": prompt}]
                )
                response_text = response.choices[0].message.content
                cost = QUILL_PRICING.get("perplexity-search", 10)
            
            else:
                return {"success": False, "error": f"Unknown provider: {provider}"}

            return {
                "success": True,
                "provider": provider,
                "model": model,
                "content": response_text,
                "quills_deducted": cost
            }

        except Exception as e:
            print(f"Router Error [{provider}]: {e}")
            return {"success": False, "error": str(e)}
