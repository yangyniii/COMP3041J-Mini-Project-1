import re


def process_event(data):
    """Process a submission payload and return a structured evaluation result."""
    required_fields = ["title", "description", "location", "date", "organiser"]
    if not all(data.get(field) for field in required_fields):
        return {
            "status": "INCOMPLETE",
            "category": "GENERAL",
            "priority": "NORMAL",
            "note": "Missing required information."
        }

    if not re.match(r"^\d{4}-\d{2}-\d{2}$", data["date"]):
        return {
            "status": "NEEDS REVISION",
            "category": "GENERAL",
            "priority": "NORMAL",
            "note": "Invalid date format. Use YYYY-MM-DD."
        }

    if len(data["description"]) < 40:
        return {
            "status": "NEEDS REVISION",
            "category": "GENERAL",
            "priority": "NORMAL",
            "note": "Description must be at least 40 characters."
        }

    content = f"{data['title']} {data['description']}".lower()
    if any(keyword in content for keyword in ["career", "internship", "recruitment"]):
        category = "OPPORTUNITY"
    elif any(keyword in content for keyword in ["workshop", "seminar", "lecture"]):
        category = "ACADEMIC"
    elif any(keyword in content for keyword in ["club", "society", "social"]):
        category = "SOCIAL"
    else:
        category = "GENERAL"

    priority_map = {
        "OPPORTUNITY": "HIGH",
        "ACADEMIC": "MEDIUM",
        "SOCIAL": "NORMAL",
        "GENERAL": "NORMAL"
    }

    return {
        "status": "APPROVED",
        "category": category,
        "priority": priority_map[category],
        "note": "Processing successful."
    }
