import json
import os
import sys
import asyncio
from container import create_container
from zone_service import ZoneService

def lambda_handler(event, context):
    container = create_container()
    zone_service = container.resolve(ZoneService)
    
    for record in event["Records"]:
        try:
            msg = json.loads(record["body"])
            zone_id = msg.get("id")
            if not zone_id:
                print("No zone_id in message")
                continue

            asyncio.run(zone_service.get_and_store_zone_coordinates(zone_id))

        except Exception as e:
            print(f"Failed to process message: {e}")

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
