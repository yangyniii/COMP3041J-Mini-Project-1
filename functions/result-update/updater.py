import requests
import os

def handler(event, context):
    record_id = event['id']
    DATA_SERVICE = os.getenv("DATA_SERVICE_URL")
    
    # 将 Processor 计算的结果回填 [cite: 28, 40]
    payload = {
        "status": event['status'],
        "category": event['category'],
        "priority": event['priority'],
        "note": event['note']
    }
    requests.patch(f"{DATA_SERVICE}/records/{record_id}", json=payload)
    return {"status": "success"}