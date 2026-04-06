from fastapi import FastAPI
from pydantic import BaseModel
from agent import run_agent
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    message: str
    resume_text: str
    history: Optional[List[Dict[str, str]]] = []

@app.get("/")
def home():
    return {"status": "🚀 AI Resume Analyzer Running (Streaming Enabled)"}

from fastapi.responses import StreamingResponse

@app.post("/chat")
def chat(query: Query):
    try:
        # We now return a StreamingResponse, which will stream chunks as they are generated
        return StreamingResponse(
            run_agent(
                user_query=query.message,
                resume_text=query.resume_text,
                history=query.history
            ),
            media_type="text/event-stream"
        )
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

from fastapi import UploadFile, File
import shutil
import os
import pdfplumber

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/extract")
async def extract_resume(file: UploadFile = File(...)):
    try:
        file_path = f"{UPLOAD_DIR}/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
                
        return {
            "success": True,
            "text": text
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
