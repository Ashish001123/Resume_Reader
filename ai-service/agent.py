from openai import OpenAI
from dotenv import load_dotenv
from mem0 import Memory
from ats_score import calculate_ats_score

load_dotenv()
client = OpenAI()

RESUME_CACHE = ""

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
You are a senior HR + backend engineer.

STRICT RULES:
- NEVER give generic feedback
- NEVER assume missing skills
- ALWAYS use project evidence
- Metrics = strong real-world impact
- No generic suggestions like networking
- Focus on backend growth (Docker, AWS, scaling)
- Avoid repeating similar suggestions (e.g., Docker twice)

CRITICAL:
- DO NOT change ATS score
- DO NOT invent weaknesses

OUTPUT FORMAT (STRICT):

## 📊 ATS Score
<score>/100

## 📌 Breakdown
- Skills: X/30
- Projects: X/25
- Experience: X/20
- Education: X/10
- Keywords: X/15

## ✅ Strengths
- (based on real resume)

## ❌ Weaknesses
- (ONLY real gaps)

## 💡 Suggestions
- (specific, backend-focused)
"""

CHAT_PROMPT = """
You are a senior backend engineer mentor.

RULES:
- Always use resume
- No generic answers
- Be practical and direct

IF role asked:
→ give 3–5 roles + reason

IF roadmap asked:
→ give next-level backend roadmap (NOT basics)

IF improvement asked:
→ give only high-impact changes
"""

def store_resume(resume_text):
    global RESUME_CACHE
    RESUME_CACHE = resume_text.strip()

    memory_client.add(
        user_id=user_id,
        messages=[{"role": "system", "content": f"[RESUME]\n{resume_text}"}]
    )

def get_resume():
    global RESUME_CACHE

    if RESUME_CACHE:
        return RESUME_CACHE

    return ""


def enforce_output_format(reply, score, breakdown):
    if "## ✅ Strengths" in reply:
        clean_reply = reply.split("## ✅ Strengths")[1]
        clean_reply = "## ✅ Strengths" + clean_reply
    else:
        clean_reply = reply

    return f"""
## 📊 ATS Score
{score}/100

## 📌 Breakdown
- Skills: {breakdown['skills']}/30
- Projects: {breakdown['projects']}/25
- Experience: {breakdown['experience']}/20
- Education: {breakdown['education']}/10
- Keywords: {breakdown['keywords']}/15

{clean_reply.strip()}
"""



def run_agent(user_query=None, resume_text=None):

    try:
        if resume_text:
            store_resume(resume_text)
            user_query = "Analyze my resume"
            mode = "analysis"
        else:
            mode = "chat"

        resume = get_resume()

        if not resume:
            return "👋 Upload resume first"
        if user_query.lower().strip() in ["hi", "hello", "hey"]:
            return "👋 Ask me anything about your resume"

        ats_score, breakdown = calculate_ats_score(resume)

        system_prompt = ANALYSIS_PROMPT if mode == "analysis" else CHAT_PROMPT

        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"""
Resume:
{resume}

Question:
{user_query}

ATS SCORE: {ats_score}

Breakdown:
Skills: {breakdown['skills']}/30
Projects: {breakdown['projects']}/25
Experience: {breakdown['experience']}/20
Education: {breakdown['education']}/10
Keywords: {breakdown['keywords']}/15

STRICT:
- Do NOT modify scores
- Use only resume data
"""
            }
        ]

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )

        raw_reply = response.choices[0].message.content

        if mode == "analysis":
            final_reply = enforce_output_format(raw_reply, ats_score, breakdown)
        else:
            final_reply = raw_reply

        memory_client.add(
            user_id=user_id,
            messages=[
                {"role": "user", "content": user_query},
                {"role": "assistant", "content": final_reply}
            ]
        )

        return final_reply

    except Exception as e:
        return f"❌ Error: {str(e)}"