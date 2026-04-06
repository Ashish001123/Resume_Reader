from openai import OpenAI
from dotenv import load_dotenv
from ats_score import calculate_ats_score

load_dotenv()
client = OpenAI()

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

def run_agent(user_query=None, resume_text=None, history=None):
    try:
        if not resume_text:
            yield "👋 Upload a resume first to start."
            return
            
        history = history or []
        
        mode = "analysis" if user_query == "Analyze my resume" else "chat"

        ats_score, breakdown = calculate_ats_score(resume_text)

        system_prompt = ANALYSIS_PROMPT if mode == "analysis" else CHAT_PROMPT
        
        messages = [{"role": "system", "content": system_prompt}]
        
        for msg in history:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

        messages.append({
            "role": "user",
            "content": f"""
Resume:
{resume_text}

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
        })

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            stream=True
        )

        if mode == "analysis":
            header = f"""## 📊 ATS Score\n{ats_score}/100\n\n## 📌 Breakdown\n- Skills: {breakdown['skills']}/30\n- Projects: {breakdown['projects']}/25\n- Experience: {breakdown['experience']}/20\n- Education: {breakdown['education']}/10\n- Keywords: {breakdown['keywords']}/15\n\n"""
            yield header

        for chunk in response:
            if chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content

    except Exception as e:
        yield f"❌ Error: {str(e)}"