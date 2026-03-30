from fastapi import FastAPI, UploadFile, File  
from pydantic import BaseModel
from agent import run_agent
from fastapi.middleware.cors import CORSMiddleware
import shutil   
import os       #
import pdfplumber 

from rag.ingest import index_resume  

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class Query(BaseModel):
    message: str

@app.get("/")
def home():
    return {"status": "🚀 AI Resume Analyzer Running"}


@app.post("/chat")
def chat(query: Query):
    try:
        response = run_agent(user_query=query.message)
        return {
            "success": True,
            "response": response
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    try:
        file_path = f"{UPLOAD_DIR}/{file.filename}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        index_resume(file_path)
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        response = run_agent(resume_text=text)

        return {
            "success": True,
            "analysis": response
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


