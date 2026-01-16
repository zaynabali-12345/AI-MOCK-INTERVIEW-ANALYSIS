from flask import Flask, jsonify
import requests

app = Flask(__name__)

# Your free API key from https://openrouter.ai
API_KEY = "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"

@app.route("/generate_topic")
def generate_topic():
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "mistralai/mistral-7b-instruct",  # free open-source model
        "messages": [
            {"role": "user", "content": "Give one interesting and unique group discussion topic for students or professionals."}
        ]
    }

    response = requests.post(url, headers=headers, json=data)
    result = response.json()
    topic = result["choices"][0]["message"]["content"]
    return jsonify({"gd_topic": topic})

if __name__ == "__main__":
    app.run(debug=True)
