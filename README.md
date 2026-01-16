

# 🧠 AI Mock Interview System

> **“Turn Practice Into Placement” — An Intelligent Career Development Platform**

![Python](https://img.shields.io/badge/Python-3.9%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Framework-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## 🚀 Overview

The **AI Mock Interview System** is a next-generation **AI-driven interview preparation platform** that combines
🧠 **Natural Language Processing (NLP)**,
🎙️ **Speech Recognition**, and
🤖 **Generative AI (Gemini 1.5 & 2.5)**
to evaluate communication skills, confidence, and domain readiness.

This system simulates real-world HR and Group Discussions, analyzes resumes, and provides personalized career insights — all in one unified platform.

---

## 🧩 Core Modules

### 📝 1️⃣ Resume Analyzer

An AI-based resume scanner that evaluates your resume against job descriptions using NLP and ATS logic.
**Features:**

* ✅ ATS (Applicant Tracking System) score
* ✅ Extracts skills, education, experience
* ✅ Highlights missing keywords
* ✅ AI feedback via **Gemini 1.5 Pro**

**Tech Stack:** `spaCy`, `Hugging Face Transformers`, `Regex`, `FastAPI`, `Gemini`, `MongoDB`

---

### 🌐 2️⃣ Interview Review Analyzer

Aggregates **authentic interview experiences** from platforms like Reddit and Google (via SerpAPI).
**Outputs:**

* Real interview questions & insights
* Role-based preparation guidance
* Company-specific difficulty level & strategy

**Tech Stack:** `SerpAPI`, `Reddit API`, `Gemini 1.5 Pro`, `FastAPI`, `Pydantic`

---

### 🎯 3️⃣ Career Path Advisor

Acts as your **AI career mentor**, analyzing your skills and interests to suggest ideal career paths.
**Outputs:**

* Top 3 career matches
* Stage-wise roadmap & certifications
* AI-generated personalized learning plan

**Models:** `SentenceTransformer (all-MiniLM-L6-v2)` + `Gemini 1.5 Pro`

**Flow:**
🧍User Input → 🤖 Semantic Match → 🪄 Gemini Roadmap Generation

---

### 🗣️ 4️⃣ Group Discussion (GD) Analyzer

Simulates **Zoom-like group discussions** and evaluates performance based on speech analytics.
**Features:**

* Real-time audio streaming (WebRTC + Socket.IO)
* Speech-to-text transcription (Google STT)
* Confidence & clarity scoring
* AI feedback summary

**Stack:** `FastAPI`, `Socket.IO`, `Gemini 2.5 Pro`, `Google STT`, `MongoDB`

---

### 💼 5️⃣ Top Job Platform Ranking

Finds the **best job portals** for your skills and experience using real API data.
**Process:**

* User enters skills, experience, work mode
* API fetches live job data (LinkedIn / JSearch)
* Gemini generates ranked summary with pros & cons

**Sample Output:**

```
Platform: LinkedIn  
Match Score: 92%  
Pros: Large network, Easy Apply  
Cons: High competition
```

**Tech Stack:** `FastAPI`, `SentenceTransformer`, `Gemini 1.5 Flash`, `MongoDB`

---

### 🧍‍♂️ 6️⃣ HR Round Simulator

A **realistic HR interview experience** where AI acts as your interviewer.
**Flow:**
👋 Greeting → 🎤 3 Role-Based Questions → 💬 Closing Statement → 🧠 AI Feedback

**Core Technologies:**

* `Google Generative AI (Gemini)` → Dynamic conversation + feedback
* `gTTS` → Converts AI text to HR voice
* `AssemblyAI` → Real-time voice-to-text
* `MongoDB` → Stores sessions & feedback

**Key Features:**
✅ Voice-based natural interview
✅ JSON-formatted AI feedback (clarity, confidence, professionalism)
✅ Real-time HR personality using prompt engineering

---

## 🔐 Authentication & User Flow

### 👥 Local Signup & Login

* Secure signup with **bcrypt-hashed** passwords
* Login via email or username
* JWT-based authentication

### 🌍 Google Sign-In

* One-click login with **Google OAuth 2.0**
* Automatically creates user profiles in MongoDB
* Prevents duplicate accounts

### 📧 SMTP Email Integration

After signup, users receive a **welcome email** via SMTP (Simple Mail Transfer Protocol).
SMTP ensures reliable, authenticated email delivery using your email credentials.

---

## 🧠 AI & Tech Stack

| Component             | Tool / Model         | Purpose                       |
| --------------------- | -------------------- | ----------------------------- |
| 🧾 Resume Parsing     | spaCy + Hugging Face | Entity & skill extraction     |
| 📊 Similarity Scoring | SentenceTransformer  | Career match & JD alignment   |
| 💬 AI Conversation    | Gemini 1.5 / 2.5     | HR Q&A and feedback           |
| 🎙️ Speech-to-Text    | AssemblyAI           | Voice-to-text transcription   |
| 🔊 Text-to-Speech     | gTTS                 | HR voice output               |
| 😃 Emotion/Confidence | DeepFace / Mediapipe | Voice & face tone detection   |
| 🗄️ Database          | MongoDB              | User data & analytics storage |
| ⚡ Backend             | FastAPI              | REST API & AI orchestration   |

---

## 🏗️ System Architecture

```
[Frontend: React + TailwindCSS]
        ↓
[FastAPI Backend (Python)]
        ↓
[AI Layer: Gemini, AssemblyAI, DeepFace]
        ↓
[MongoDB Database]
        ↓
[User Dashboard → Analytics & Feedback]
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/ai-mock-interview.git
cd ai-mock-interview
```

### 2️⃣ Install Requirements

```bash
pip install -r requirements.txt
```

### 3️⃣ Environment Variables

Create a `.env` file:

```
GOOGLE_API_KEY=your_google_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_key
MONGO_URI=your_mongodb_uri
SMTP_USER=your_email
SMTP_PASS=your_password
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### 4️⃣ Run Application

```bash
uvicorn app.main:app --reload
```

---

## 📊 Output Examples

### ✅ Resume Analyzer

* ATS Score: 82%
* Missing Skills: AWS, Docker
* Feedback: *“Excellent technical base. Add quantified results for impact.”*

### 🧠 HR Interview Feedback

```
Clarity: 9/10  
Confidence: 8/10  
Relevance: 9/10  
Overall: 8.6/10
Summary: Clear, confident communicator with strong examples.
```

### 🎯 Career Advisor

→ Suggests Top 3 Roles
→ Generates Skill Roadmap
→ Lists Certifications

---

## 👩‍💻 Team Members

| Name                 | Role               | Responsibilities                     |
| -------------------- | ------------------ | ------------------------------------ |
| **Misba Falak Khan** | Team Lead          | AI Integration, Backend Architecture |
| **Prerna**           | Frontend Developer | UI/UX Design, React Development      |
| **Zaynab**           | Research & QA      | Data Research, Documentation         |

---

## 🌟 Future Enhancements

* 📈 Advanced facial expression analytics
* 💼 Company-specific HR Q&A training
* 🔗 LinkedIn & Glassdoor data sync
* 🧩 Resume auto-format optimizer

---

## 🏁 Conclusion

The **AI Mock Interview System** merges **AI, NLP, and Speech Intelligence** to simulate real interview experiences.
It prepares users end-to-end — from resume enhancement to HR interview feedback — making career preparation more interactive, intelligent, and personalized.

> **“From Application to Interaction — Empowering Candidates with AI.”**

---
