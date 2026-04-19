from flask import Flask, request, jsonify
import requests
import os
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask application
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS)
CORS(app)

# External service endpoints (container + serverless)
DATA_SERVICE = os.getenv("DATA_SERVICE_URL", "http://localhost:5002")
EVENT_FUNC = os.getenv("SUBMISSION_EVENT_URL", "http://localhost:8080/event")


@app.route("/", methods=["GET"])
def home():
    """
    API documentation endpoint
    """
    return jsonify({
        "message": "Campus Buzz Workflow Service API",
        "version": "1.0",
        "endpoints": {
            "POST /api/submit": "Submit a new event for processing"
        }
    })


@app.route('/api/submit', methods=['POST'])
def handle_submission():
    """
    Workflow Service (Orchestrator)

    Responsibilities:
    1. Validate incoming request (pre-check)
    2. Create record in Data Service
    3. Trigger serverless event function (async processing)
    4. Return immediate response (202 Accepted)
    """

    payload = request.get_json(force=True)

    # =====================================================
    # 1. PRE-VALIDATION (IMPORTANT - prevents bad data entry)
    # =====================================================
    required_fields = ["title", "description", "location", "date", "organiser"]

    missing_fields = [field for field in required_fields if not payload.get(field)]

    if missing_fields:
        return jsonify({
            "error": "Invalid submission",
            "message": "Missing required fields",
            "missing_fields": missing_fields
        }), 400  # ❗ Do NOT store invalid data

    # =====================================================
    # 2. CREATE RECORD IN DATA SERVICE (VALID DATA ONLY)
    # =====================================================
    data_payload = {**payload, "status": "PENDING"}

    try:
        data_response = requests.post(
            f"{DATA_SERVICE}/records",
            json=data_payload,
            timeout=5
        )
    except requests.RequestException as e:
        return jsonify({
            "error": "Data Service unreachable",
            "details": str(e)
        }), 502

    # Handle Data Service failure
    if data_response.status_code != 201:
        return jsonify({
            "error": "Failed to create record in Data Service",
            "details": data_response.text
        }), 502

    record = data_response.json()

    # =====================================================
    # 3. TRIGGER SERVERLESS EVENT FUNCTION (ASYNC)
    # =====================================================
    event_payload = {
        "id": record["id"],
        **payload
    }

    try:
        requests.post(EVENT_FUNC, json=event_payload, timeout=5)
    except requests.RequestException:
        # Fire-and-forget: do not block user response
        pass

    # =====================================================
    # 4. RETURN RESPONSE (NON-BLOCKING)
    # =====================================================
    return jsonify({
        "message": "Submission received",
        "id": record["id"],
        "status": "PENDING"
    }), 202


if __name__ == "__main__":
    """
    Entry point for Workflow Service
    """
    app.run(host="0.0.0.0", port=5001)