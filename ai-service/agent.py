from openai import OpenAI
from dotenv import load_dotenv
from mem0 import Memory
from rag.rag import search_docs

load_dotenv()
client = OpenAI()
config = {
    "vector_store": {
        "provider": "qdrant",
        "config": {
            "host": "localhost",
            "port": 6333
        }
    }
}

memory_client = Memory.from_config(config)
user_id = "Vaibhav"

ANALYSIS_PROMPT = """
You are a professional AI Resume Analyzer.

Analyze the resume and return response in CLEAN MARKDOWN format.

## ✅ Strengths
- ...

## ❌ Weaknesses
- ...

## 💡 Suggestions
- ...

## 📊 ATS Score
**XX/100**

Rules:
- Proper spacing
- Bullet points
- Honest HR-style feedback
"""

CHAT_PROMPT = """
You are an expert AI Resume Assistant.

You MUST use resume context and also infer skill level intelligently.
if user gives greeting or hlo give back the response and ask to upload resume for further help politely and lovelinghly with emojies.

CRITICAL RULES:
- DO NOT invent unrelated skills (e.g., customer service, attendance)
- ONLY use skills present in resume
- BUT you SHOULD infer strength from projects and technologies

IMPORTANT:
- Real-world projects = strong evidence of skill
- MERN stack + backend + APIs = high technical proficiency
- Performance optimization = strong problem-solving
- Lack of internships = slight deduction, not major

RATING GUIDELINES:
- Strong projects → 8+ score
- Backend + APIs + DB work → 7+ system design
- Missing soft skills → reduce communication score slightly

If rating:
- Always include:
  - Technical Skills
  - Problem Solving
  - System Design / Backend
  - Communication

Tone:
- Honest
- Balanced
- Insightful (like a senior engineer reviewing resume)

DO NOT:
- Underrate strong candidates
- Ignore project experience
- Say "not enough information" if context exists
"""


def run_agent(user_query: str = None, resume_text: str = None):

    if resume_text and not user_query:
        user_query = "Analyze this resume"
        mode = "analysis"
    else:
        mode = "chat"

    search_memory = memory_client.search(
        query=user_query or "resume",
        user_id=user_id
    )

    memories = [
        mem.get("memory", "")
        for mem in search_memory.get("results", [])
    ]

    memory_context = "\n".join(memories) if memories else ""

    if resume_text:
        rag_context = resume_text
    else:
        rag_context = search_docs(user_query)

    if not rag_context or "No resume data found" in rag_context:
        rag_context = """
User resume includes:
- Java, JavaScript
- MERN stack projects
- Backend development (Node.js, Express)
- Database experience (MongoDB, SQL)
"""

    if mode == "analysis":
        system_prompt = ANALYSIS_PROMPT
    else:
        system_prompt = CHAT_PROMPT

    FINAL_PROMPT = f"""
{system_prompt}

Resume Context:
{rag_context}

Previous Memory:
{memory_context}

User Query:
{user_query}

Instructions:
- ALWAYS use resume context
- NEVER give generic answers
- Be specific and helpful
"""

    messages = [
        {"role": "system", "content": FINAL_PROMPT},
        {"role": "user", "content": user_query}
    ]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages
    )

    reply = response.choices[0].message.content

    memory_client.add(
        user_id=user_id,
        messages=[
            {"role": "user", "content": user_query},
            {"role": "assistant", "content": reply}
        ]
    )

    print("✅ memory saved")

    return reply