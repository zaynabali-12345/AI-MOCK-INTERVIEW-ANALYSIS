from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.concurrency import run_in_threadpool
import io
import docx
import fitz  # PyMuPDF

from ..services import resume_analyzer

router = APIRouter()

async def read_file_content(file: UploadFile) -> str:
    """Reads content from UploadFile based on its content type."""
    content = await file.read()
    
    if file.content_type == "application/pdf":
        try:
            pdf_document = fitz.open(stream=io.BytesIO(content), filetype="pdf")
            text = ""
            for page in pdf_document:
                text += page.get_text()
            return text
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing PDF file: {e}")
    elif file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        try:
            doc = docx.Document(io.BytesIO(content))
            return "\n".join([para.text for para in doc.paragraphs])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing DOCX file: {e}")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a PDF or DOCX.")

@router.post("/analyze-resume", tags=["Resume"])
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form("")
):
    """
    Analyzes a resume file against a job description.
    """
    file_content = await read_file_content(resume)
    structured_data = await run_in_threadpool(resume_analyzer.analyze_resume_against_jd, file_content, job_description)
    return {"filename": resume.filename, "analysis": structured_data}