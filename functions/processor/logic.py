import re


def process_event(data):
    """Process a submission payload and return structured result."""

    required_fields = ["title", "description", "location", "date", "organiser"]

    # =========================
    # 1. INCOMPLETE (highest priority)
    # =========================
    missing_fields = [field for field in required_fields if not data.get(field)]

    if missing_fields:
        return {
            "status": "INCOMPLETE",
            "final_status": "INCOMPLETE",
            "category": "GENERAL",
            "assigned_category": "GENERAL",
            "priority": "NORMAL",
            "assigned_priority": "NORMAL",
            "note": f"Missing fields: {', '.join(missing_fields)}"
        }

    # =========================
    # 2. Date format check
    # =========================
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", data["date"]):
        return {
            "status": "NEEDS REVISION",
            "final_status": "NEEDS REVISION",
            "category": "GENERAL",
            "assigned_category": "GENERAL",
            "priority": "NORMAL",
            "assigned_priority": "NORMAL",
            "note": "Invalid date format. Expected YYYY-MM-DD."
        }

    # =========================
    # 3. Description length check
    # =========================
    if len(data["description"]) < 40:
        return {
            "status": "NEEDS REVISION",
            "final_status": "NEEDS REVISION",
            "category": "GENERAL",
            "assigned_category": "GENERAL",
            "priority": "NORMAL",
            "assigned_priority": "NORMAL",
            "note": "Description must be at least 40 characters."
        }

    # =========================
    # 4. Category assignment
    # =========================
    content = f"{data['title']} {data['description']}".lower()

    if any(k in content for k in ["career", "internship", "recruitment"]):
        category = "OPPORTUNITY"
    elif any(k in content for k in ["workshop", "seminar", "lecture"]):
        category = "ACADEMIC"
    elif any(k in content for k in ["club", "society", "social"]):
        category = "SOCIAL"
    else:
        category = "GENERAL"

    # =========================
    # 5. Priority mapping
    # =========================
    priority_map = {
        "OPPORTUNITY": "HIGH",
        "ACADEMIC": "MEDIUM",
        "SOCIAL": "NORMAL",
        "GENERAL": "NORMAL"
    }

    return {
        "status": "APPROVED",
        "final_status": "APPROVED",
        "category": category,
        "assigned_category": category,
        "priority": priority_map[category],
        "assigned_priority": priority_map[category],
        "note": "All checks passed successfully."
    }