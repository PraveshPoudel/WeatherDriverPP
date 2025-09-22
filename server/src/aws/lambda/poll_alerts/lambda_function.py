import asyncio
from container import create_container
from alert_service import AlertService

# poll_alerts lambda to be triggered by a timer and 
# get active alerts and store each of those in Dynamo

def lambda_handler(event, context):
    container = create_container()
    alert_service = container.resolve(AlertService)

    alerts = asyncio.run(alert_service.get_and_store_active_alerts())
    return {
        "statusCode": 200,
        "body": f"Alerts processed successfully: {alerts} alerts found."
    }


if __name__ == "__main__":
    lambda_handler(None, None)