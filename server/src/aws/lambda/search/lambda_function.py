import simplejson as json
from container import create_container
from alert_service import AlertService

def lambda_handler(event, context):
    container = create_container()
    alert_service = container.resolve(AlertService)
    
    alerts = []
    # Parse coordinates from HTTP request (API Gateway proxy integration)
    try:
        coordinates = []
        body = event.get("body")
        if body and isinstance(body, str):
            body = json.loads(body)
        elif not body:
            body = event

        # Expecting: {"coordinates": [[lat, lon], ...]}
        coordinates = body.get("coordinates")
        if not coordinates or not isinstance(coordinates, list):
            alerts = alert_service.get_all_weather_alerts()
        else:
            alerts = alert_service.get_weather_alerts_by_coords(coordinates)
    except Exception as e:
        return {
            'statusCode': 400,
            'body': json.dumps({"error": f"Invalid input: {str(e)}"})
        }

    

    return {
        'statusCode': 200,
        'body': json.dumps({'url': alerts})
    }

if __name__ == "__main__":
    # Example test event
    test_event = {
        "body": json.dumps({
            "coordinates": [
                [58, -160],
                [33, -93.4]
            ]
        })
    }
    result = lambda_handler(test_event, None)
    print(result)
