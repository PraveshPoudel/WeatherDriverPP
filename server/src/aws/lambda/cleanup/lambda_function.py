from container import create_container
from alert_service import AlertService

# poll_alerts lambda to be triggered by a timer and 
# get active alerts and store each of those in Dynamo

def lambda_handler(event, context):
    container = create_container()
    alert_service = container.resolve(AlertService)

    alert_count = alert_service.remove_expired_alerts()
    return {
        "statusCode": 200,
        "body": f"Removed {alert_count} expired alerts."
    }


if __name__ == "__main__":
    lambda_handler(None, None)