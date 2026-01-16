import google.generativeai as genai

# Configure Gemini with your working key
genai.configure(api_key="AIzaSyDT5zcoMOgAa7E8_haS-jzpEOH5-9NDrlY")

# Use the latest available model
model = genai.GenerativeModel("gemini-2.5-flash")

# Generate HR-like test response
response = model.generate_content("Hi, I’m testing my AI HR interview system. Can you greet the candidate?")
print("\n🤖 Gemini says:\n", response.text)
