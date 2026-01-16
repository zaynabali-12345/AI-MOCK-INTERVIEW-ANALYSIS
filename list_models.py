import requests

API_KEY = "AIzaSyDVCNcd1q-V9hyRwiC_5QaoXGNRkQZUxBM"  # replace with your actual Gemini API key
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"

response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    print("Available Models:")
    for model in data.get("models", []):
        print("-", model.get("name"))
else:
    print("Error:", response.status_code, response.text)
