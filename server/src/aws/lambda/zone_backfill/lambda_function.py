import json
import asyncio
import time
from container import create_container
from zone_service import ZoneService

def lambda_handler(event, context):
    print("Starting Lambda handler for zone backfill...")
    start = time.time()
    container = create_container()
    zone_service = container.resolve(ZoneService)

    asyncio.run(zone_service.get_and_store_all_zones())

    duration_ms = int((time.time() - start) * 1000)
    print(f"Zone backfill completed in {duration_ms} ms")

    return {
        'statusCode': 200,
        'body': json.dumps(f'Zone backfill completed Duration: {duration_ms} ms')
    }

if __name__ == "__main__":
    lambda_handler(None, None)
