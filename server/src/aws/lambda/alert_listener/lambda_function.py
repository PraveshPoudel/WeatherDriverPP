import json
import os
import sys
import asyncio
from container import create_container
from alert_service import AlertService

def lambda_handler(event, context):
    """
    Lambda handler for processing SQS messages with alert IDs.
    For each alert:
      - Get the alert from DynamoDB
      - Get affected zones and their coordinates
      - Upsert a record into a new table of alerts with alert and zone info
    """
    container = create_container()
    alert_service = container.resolve(AlertService)
    
    for record in event["Records"]:
        msg = json.loads(record["body"])
        alert_id = msg.get("id")
        if not alert_id:
            print("No alert_id in message")
            continue

        asyncio.run(alert_service.build_and_store_weather_alert(alert_id))
        
        # try:
        #     msg = json.loads(record["body"])
        #     alert_id = msg.get("id")
        #     if not alert_id:
        #         print("No alert_id in message")
        #         continue

        #     asyncio.run(alert_service.build_and_store_weather_alert(alert_id))

        # except Exception as e:
            # print(f"Failed to process message: {e}")

    return {
        'statusCode': 200,
        'body': json.dumps('Processed SQS messages')
    }

if __name__ == "__main__":
    # Try to load sqs.json from the same directory as this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    event_file = os.path.join(script_dir, "sqs.json")
    if not os.path.isfile(event_file):
        print(f"Test event file not found: {event_file}")
        sys.exit(1)
    with open(event_file) as f:
        event = json.load(f)
    lambda_handler(event, None)
