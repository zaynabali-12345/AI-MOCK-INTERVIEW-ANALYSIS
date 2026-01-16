# list_gemini_models.py
from google import generativeai as genai
import os

# Set your Gemini API key
os.environ["GOOGLE_API_KEY"] = "AIzaSyBRNqe4G1rnGdH0rlJOCtT7luCJYaKtWNA"

# Configure the client
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# List all available models
models = genai.list_models()

print("\n🧠 Available Gemini Models:\n")
for i, model in enumerate(models):
    name = model.name
    methods = ", ".join(model.supported_generation_methods)
    print(f"{i+1}. {name}  [{methods}]")
