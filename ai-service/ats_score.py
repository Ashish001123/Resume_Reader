def calculate_ats_score(text: str):

    text = text.lower()

    score = 0
    breakdown = {}
    skills = [
        "node", "express", "mongodb", "react",
        "api", "jwt", "sql", "docker"
    ]

    skill_matches = sum(1 for s in skills if s in text)
    skill_score = min(skill_matches * 4, 30)
    breakdown["skills"] = skill_score
    score += skill_score

    project_score = 0

    if "project" in text:
        project_score += 10
    if "real-time" in text or "chat" in text:
        project_score += 5
    if "e-commerce" in text:
        project_score += 5
    if "api" in text:
        project_score += 5

    project_score = min(project_score, 25)
    breakdown["projects"] = project_score
    score += project_score

    exp_score = 0
    if "intern" in text:
        exp_score += 15
    if "experience" in text:
        exp_score += 5

    breakdown["experience"] = exp_score
    score += exp_score

    edu_score = 0
    if "computer science" in text:
        edu_score = 10

    breakdown["education"] = edu_score
    score += edu_score

    keywords = ["rest", "scalable", "optimization", "latency", "jwt"]

    keyword_score = sum(3 for k in keywords if k in text)
    keyword_score = min(keyword_score, 15)

    breakdown["keywords"] = keyword_score
    score += keyword_score

    return min(score, 100), breakdown