from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from typing import Any
import pypdf
import docx
from io import BytesIO

from ..services import resume_analyzer
from ..core.security import get_current_user
from ..models.user import UserOut

router = APIRouter()

def extract_text_from_pdf(file_stream: BytesIO) -> str:
    """Extracts text from a PDF file stream."""
    try:
        reader = pypdf.PdfReader(file_stream)
        return "".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF file: {e}")

def extract_text_from_docx(file_stream: BytesIO) -> str:
    """Extracts text from a DOCX file stream."""
    try:
        doc = docx.Document(file_stream)
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing DOCX file: {e}")

@router.post("/analyze-resume", tags=["Resume Analyzer"])
async def analyze_resume_endpoint(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    current_user: UserOut = Depends(get_current_user)
):
    """
    Receives a resume file and a job description, analyzes them,
    and returns a detailed analysis.
    """
    if not resume.content_type in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF or DOCX file.")

    try:
        file_content = await resume.read()
        file_stream = BytesIO(file_content)
        
        if resume.content_type == "application/pdf":
            resume_text = extract_text_from_pdf(file_stream)
        else: # DOCX
            resume_text = extract_text_from_docx(file_stream)

        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the resume. The file might be empty or image-based.")

        analysis_result = resume_analyzer.analyze_resume_against_jd(resume_text, job_description)
        
        return {"message": "Analysis successful", "analysis": analysis_result}

    except HTTPException as e:
        raise e # Re-raise HTTP exceptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")