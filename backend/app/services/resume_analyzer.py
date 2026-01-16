import re
import spacy
import os
import json
from transformers import pipeline
from typing import List, Dict, Any, Set
import time
from google.api_core.exceptions import ResourceExhausted
import google.generativeai as genai
import logging

from ..core.config import settings

# --- Model and Pipeline Initialization ---
# It's good practice to load models once and reuse them.
# Models should be downloaded via the `download_models.py` script before starting the app.
# This avoids trying to download models at runtime.
logger = logging.getLogger(__name__)

nlp = spacy.load("en_core_web_sm")

ner_pipeline = pipeline("ner", model="dslim/bert-base-NER", aggregation_strategy="simple")

# --- Constants ---
NON_NAMES = {name.lower() for name in {"MERN Stack", "Stack", "Problem Solving", "Education", "Projects", "Skills", "Experience"}}

# A more comprehensive list of skills
SKILLS_LIST = [
    "Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "HTML", "CSS", "React", "Angular", "Vue.js", "Node.js", 
    "Express.js", "FastAPI", "Django", "Flask", "Spring Boot", "Ruby on Rails",
    "MongoDB", "SQL", "PostgreSQL", "MySQL", "NoSQL", "GraphQL",
    "Git", "GitHub", "GitLab", "CI/CD", "Jenkins", "Docker", "Kubernetes", "Terraform",
    "AWS", "Azure", "Google Cloud", "GCP", "Heroku",
    "Machine Learning", "Data Analysis", "NLP", "Natural Language Processing", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch",
    "Project Management", "Agile", "Scrum", "JIRA", "Software Development Life Cycle", "SDLC"
]

AI_PROMPT_TEMPLATE = """
You are an expert career coach reviewing a resume. Based on the following analysis, provide a professional and encouraging feedback paragraph (3-4 sentences).

Analysis Data:
- Candidate Type: {candidate_type}
- ATS Score: {ats_score}%
- Matched Skills: {skills}
- Missing Skills from Job Description: {missing_skills}
- Experience Summary: {experience_summary}
- Education Summary: {education_summary}

Your feedback should start with an encouraging sentence. If the candidate is 'experienced', suggest using action verbs and metrics. If they are a 'fresher', recommend detailing project work. If the ATS score is low, advise tailoring the resume to the job description and including missing keywords. Provide only the feedback paragraph, without any preamble.
"""

# --- Extraction Functions ---

def extract_name(text: str) -> str:
    """
    Extracts a name using a combination of spaCy and a Hugging Face NER model
    to improve accuracy. It prioritizes the longest name found.
    """
    text_to_search = text[:500] # Search in the top 500 characters
    all_names = set()

    # 1. Try with spaCy
    doc = nlp(text_to_search)
    for ent in doc.ents:
        if ent.label_ == 'PERSON' and ent.text.lower() not in NON_NAMES:
            all_names.add(ent.text.strip())

    # 2. Try with Hugging Face NER
    # We avoid .title() as it can alter the structure NER models expect
    try:
        ner_results = ner_pipeline(text_to_search) # With aggregation_strategy="simple", each result is a full entity
        for entity in ner_results:
            if entity['entity_group'] == 'PER' and entity['word'].lower() not in NON_NAMES and len(entity['word']) > 1:
                clean_name = entity['word'].replace('##', '').strip()
                all_names.add(clean_name)
    except Exception:
        pass # Silently fail if the model has issues

    # 3. Fallback with a simple regex for "Firstname Lastname" at the start
    regex_match = re.match(r"^\s*([A-Z][a-z]+(?: [A-Z][a-z]+){1,2})", text_to_search)
    if regex_match:
        all_names.add(regex_match.group(1).strip())

    return max(list(all_names), key=len) if all_names else "N/A"
def extract_contact_info(text: str) -> Dict[str, List[str]]:
    """Extracts emails and phone numbers."""
    emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    phones = re.findall(r'(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})', text)
    return {"emails": sorted(list(set(emails))), "phone_numbers": sorted(list(set(phones)))}

def extract_skills(text: str, skills_list: List[str]) -> List[str]:
    """Extracts skills from text based on a predefined list."""
    found_skills = set()
    for skill in skills_list:
        if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
            found_skills.add(skill)
    return sorted(list(found_skills), key=str.lower)

def extract_section(text: str, section_titles: List[str]) -> str:
    """
    Extracts a whole section from the resume text based on a list of possible titles.
    This version is more robust and uses line-by-line checking instead of a single large regex.
    """
    lines = text.split('\n')
    start_index = -1
    end_index = len(lines)

    # A list of all known section titles to detect the end of the current section
    all_section_headers = ["experience", "education", "skills", "projects", "certifications", "summary", "objective", "awards", "publications", "work experience", "academic qualifications"]

    # Find the start line of our target section
    for i, line in enumerate(lines):
        if any(title.lower() in line.lower() for title in section_titles):
            start_index = i
            break
    
    if start_index == -1:
        return ""

    # Find the end line (the start of the *next* section)
    for i in range(start_index + 1, len(lines)):
        # Check if the line looks like a header
        line_lower = lines[i].lower().strip()
        if any(header in line_lower for header in all_section_headers if header not in [t.lower() for t in section_titles]):
             # If it's a different header, we've found the end of our section
            if len(line_lower) < 30: # Assume headers are short
                end_index = i
                break

    return "\n".join(lines[start_index:end_index])

def parse_education(section_text: str) -> List[Dict[str, str]]:
    """Parses the education section to extract degree, university, and year."""
    if not section_text:
        return []

    educations = []
    # Clean up lines and remove the header
    lines = [line.strip() for line in section_text.split('\n') if line.strip()]
    if lines and any(header in lines[0].lower() for header in ["education", "academic"]):
        lines = lines[1:]

    # Group lines that belong to the same educational entry
    grouped_entries = []
    current_entry_lines = []
    for line in lines:
        # Assume a new entry starts with a bullet point '•'
        if line.startswith('•') and current_entry_lines:
            grouped_entries.append(" ".join(current_entry_lines))
            current_entry_lines = [line]
        else:
            current_entry_lines.append(line)
    if current_entry_lines:
        grouped_entries.append(" ".join(current_entry_lines))

    # Parse each grouped entry
    for entry_text in grouped_entries:
        # Extract Year
        year_match = re.search(r'\b(20\d{2})\b', entry_text)
        year = year_match.group(1) if year_match else "N/A"

        # Extract University/College
        uni_match = re.search(r'([A-Z][\w\s]+(?:University|College|School))', entry_text, re.IGNORECASE)
        university = uni_match.group(1).strip() if uni_match else "N/A"

        educations.append({
            "degree": entry_text.replace(university, "").replace(year, "").strip("• |"),
            "university": university,
            "year": year
        })
    return educations


def parse_experience(section_text: str) -> List[Dict[str, str]]:
    """Parses the experience section to extract company name, job title, duration, and key achievements."""
    if not section_text.strip():
        return []

    experiences = []
    # Split the section into entries. This assumes a blank line or a line with a date range might separate entries.
    # This is a heuristic and can be improved.
    entries = re.split(r'\n\s*\n', section_text.strip())

    duration_pattern = re.compile(r'(\w+\s?\d{4}\s*[-–to]+\s*(?:\w+\s?\d{4}|Present|Current))', re.IGNORECASE)

    for entry in entries:
        if not entry.strip():
            continue

        lines = [line.strip() for line in entry.split('\n') if line.strip()]
        if not lines:
            continue

        # Initialize fields
        company_name = "N/A"
        job_title = "N/A"
        duration = "N/A"
        achievements = []

        # A simple approach: first line is title, second is company, or vice-versa.
        # This is a common but not universal format.
        job_title = lines[0] # Assume first line is job title
        if len(lines) > 1:
            # Check if the second line looks more like a company name
            if not duration_pattern.search(lines[1]):
                 company_name = lines[1]

        # Find duration and achievements
        for line in lines:
            duration_match = duration_pattern.search(line)
            if duration_match:
                duration = duration_match.group(0).strip()
            if line.startswith(('•', '*', '-')):
                achievements.append(line[1:].strip())

        # Avoid adding empty entries
        if job_title != "N/A" or achievements:
            experiences.append({"company_name": company_name, "job_title": job_title, "duration": duration, "achievements": achievements})

    return experiences


def parse_certifications(section_text: str) -> List[str]:
    """Extracts certifications by splitting the section text by lines."""
    if not section_text:
        return []
    # Assumes each certification is on a new line, ignoring the section title itself.
    lines = section_text.strip().split('\n')[1:]
    return [line.strip() for line in lines if line.strip()]


# --- ATS and Analysis Functions ---

def calculate_ats_score(resume_skills: Set[str], jd_skills: Set[str], candidate_type: str, education_details: List[Dict[str, str]], experience_section: str) -> Dict[str, Any]:
    """Calculates ATS score and finds missing skills."""
    
    # Initialize variables
    score = 0
    missing_skills = []
    score_basis = ""

    if candidate_type == "experienced" and jd_skills:
        # Keyword Match (skills in JD vs skills in resume): 40%
        matched_skills = resume_skills.intersection(jd_skills)
        missing_skills = jd_skills.difference(resume_skills)
        skill_score = round((len(matched_skills) / len(jd_skills)) * 40) if jd_skills else 0
        
        # Experience Match (years of experience vs JD requirement): 20%
        # This is a placeholder, as extracting years of experience is complex
        experience_score = 10 # Default value
        if experience_section and experience_section.strip():
            experience_score = 20
        # Education Match (degree vs JD requirement): 15%
        education_score = 0 # Default Value
        if education_details:
            education_score = 15
        
        # Certifications / Relevant Projects: 10%
        certs_score = 10 # Assume some certs or projects are present

        # Formatting & Readability (clear sections, bullet points, no tables/images): 15%
        formatting_score = 15

        score = skill_score + experience_score + education_score + certs_score + formatting_score
        score_basis = "Calculated based on skills, experience, education, certifications, and formatting match against the job description."

    else: # Fresher or JD missing
        # Skill Relevance (match against common industry skills): 40%
        skill_score = round((len(resume_skills) / len(SKILLS_LIST)) * 40) if SKILLS_LIST else 0

        # Education Info Quality (degree, GPA/percentage, graduation year): 25%
        education_score = 0
        if education_details:
            education_score = 25

        # Projects / Internships Mentioned: 20%
        project_score = 0
        if experience_section and experience_section.strip():
            project_score = 20

        # Formatting & Readability: 15%
        formatting_score = 15

        score = skill_score + education_score + project_score + formatting_score
        score_basis = "Calculated based on skill relevance, education quality, projects/internships, and formatting."

    return {"ATS_score": min(score, 100), # Cap at 100
            "score_basis": score_basis,
            "missing_skills": sorted(list(missing_skills), key=str.lower)
            }

def generate_recommendations(ats_results: Dict[str, Any], jd_provided: bool) -> List[str]:
    """Generates improvement suggestions based on ATS results."""
    suggestions = []
    if not jd_provided:
        suggestions.append("No job description was provided, so an ATS score could not be calculated. Paste in a job description to see how your resume matches up.")
        suggestions.append("To improve your resume generally, review your work experience bullet points. Use action verbs and quantify your achievements to demonstrate impact (e.g., 'Increased efficiency by 20%' instead of 'Responsible for improving efficiency').")
        return suggestions

    if ats_results["ATS_score"] < 50:
        suggestions.append("Your resume has a low match with the job description. Consider tailoring your skills and experience to better align with the role's requirements.")
    
    if ats_results["missing_skills"]:
        skills_to_add = ", ".join(ats_results["missing_skills"][:3])
        suggestions.append(f"Consider adding or highlighting these skills if you have experience with them: {skills_to_add}.")
    
    suggestions.append("Review your work experience bullet points. Use action verbs and quantify your achievements to demonstrate impact (e.g., 'Increased efficiency by 20%' instead of 'Responsible for improving efficiency').")
    return suggestions

def generate_summary(name: str, ats_score: int, resume_skills: List[str], jd_provided: bool) -> str:
    """Generates a brief summary of the resume's strengths and weaknesses."""
    strengths = f"The resume for {name if name != 'N/A' else 'the candidate'} shows a good foundation with skills like {', '.join(resume_skills[:3])}."
    if not jd_provided:
        weakness_score = "To get a full analysis, provide a job description to calculate an ATS match score and identify missing keywords."
    else:
        weakness_score = f"The main area for improvement is tailoring the resume for the target job, as indicated by the ATS score of {ats_score}%."
    return f"{strengths} {weakness_score} Focusing on highlighting relevant skills and quantifying achievements will significantly improve its effectiveness."

def generate_ai_feedback(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates AI-powered feedback using the Google Gemini API.
    """
    # Check if the Google API key is configured
    if not settings.GOOGLE_API_KEY:
        return {"error": "Google API key not configured for AI feedback."}

    genai.configure(api_key=settings.GOOGLE_API_KEY)
    
    # Create summaries of resume sections to provide context to the AI model
    skills_str = ", ".join(resume_data.get("skills_extracted", [])[:10]) or "Not specified"
    missing_skills_str = ", ".join(resume_data.get("missing_skills", [])) or "None"
    
    experience_summary = "Not specified"
    if resume_data.get("experience"):
        num_roles = len(resume_data["experience"])
        job_titles = ", ".join([exp.get("job_title", "a role") for exp in resume_data["experience"][:2]])
        experience_summary = f"{num_roles} role(s) listed, including {job_titles}."

    education_summary = "Not specified"
    if resume_data.get("education"):
        num_degrees = len(resume_data["education"])
        education_summary = f"{num_degrees} degree(s)/qualification(s) listed."

    try:
        prompt = AI_PROMPT_TEMPLATE.format(
            candidate_type=resume_data.get("candidate_type", "N/A"),
            ats_score=resume_data.get("ATS_score", "N/A"),
            skills=skills_str,
            missing_skills=missing_skills_str,
            experience_summary=experience_summary,
            education_summary=education_summary
        )

        # Use the Gemini Pro model
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        try:
            response = model.generate_content(prompt)
            feedback = response.text.strip()
        except ResourceExhausted:
            logger.warning("Gemini API quota exhausted. Waiting for 60 seconds before retrying.")
            time.sleep(60)
            # Retry once after waiting
            response = model.generate_content(prompt)
            feedback = response.text.strip()
        return {"feedback_summary": feedback}

    except Exception as e:
        logger.error(f"An error occurred while generating AI feedback with Gemini: {str(e)}")
        return {"feedback_summary": "Could not generate AI feedback at this time."}

def analyze_resume_against_jd(resume_text: str, job_description: str, candidate_type: str = "experienced") -> Dict[str, Any]:
    """Main function to orchestrate the entire resume analysis process."""
    
    # 1. Extract information from resume
    candidate_name = extract_name(resume_text)
    contact_info = extract_contact_info(resume_text)
    resume_skills = extract_skills(resume_text, SKILLS_LIST)
    
    # Extract experience section, including Internships for fresher profiles
    experience_section = extract_section(resume_text, ["Experience", "Work Experience", "Projects", "Internships"])
    experience_details = parse_experience(experience_section)

    # Check for keywords indicating work experience (company names, roles, dates)
    experience_keywords = re.search(r"(?:(?:(?:[A-Z][a-z]+)\s?){1,2}(?:Inc\.|LLC|Ltd\.)|\b(?:Engineer|Developer|Analyst)\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s?\d{4}\s?[-–]\s?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s?\d{4})", experience_section, re.IGNORECASE)

    # Determine candidate type based on experience keywords
    candidate_type = "experienced" if experience_keywords else "fresher"

    education_section = extract_section(resume_text, ["Education", "Academic Qualifications"])
    education_details = parse_education(education_section)

    certs_section = extract_section(resume_text, ["Certifications", "Licenses & Certifications"])
    certifications = parse_certifications(certs_section)
    jd_provided = bool(job_description and job_description.strip())
    jd_skills = extract_skills(job_description, SKILLS_LIST)
    ats_results = calculate_ats_score(set(resume_skills), set(jd_skills), candidate_type, education_details, experience_section)
    
    # 3. Provide Recommendations
    suggestions = generate_recommendations(ats_results, jd_provided)
    summary = generate_summary(candidate_name, ats_results["ATS_score"], resume_skills, jd_provided) # Pass the new ATS results
    
    # 4. Compile initial structured data
    structured_data = {
        "candidate_name": candidate_name,
        "contact_info": contact_info,
        "skills_extracted": resume_skills,
        "candidate_type": candidate_type,
        "education": education_details,
        "experience": experience_details,
        "certifications": certifications,
        "ATS_score": ats_results["ATS_score"],
        "missing_skills": ats_results["missing_skills"],
        "improvement_suggestions": suggestions,
        "resume_summary": summary
    }

    # 5. Generate AI-powered feedback
    ai_feedback = generate_ai_feedback(structured_data)
    structured_data["ai_feedback"] = ai_feedback

    return structured_data