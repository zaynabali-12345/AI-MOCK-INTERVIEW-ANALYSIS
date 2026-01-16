import google.generativeai as genai

genai.configure(api_key="AIzaSyDT5zcoMOgAa7E8_haS-jzpEOH5-9NDrlY")

for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(m.name)
