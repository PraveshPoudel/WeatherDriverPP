from datetime import datetime, timezone
from decimal import Decimal
import uuid
import simplejson as json
import logging
from WeatherAlertModel import Geometry, WeatherAlert
from noaa_client import NoaaClient
from dynamo_client import DynamoDbClient
from s3_client import S3Client
from sqs_client import SqsClient
from zone_service import ZoneService

class AlertService:
    def __init__(self, noaa_client: NoaaClient, dynamo_client: DynamoDbClient, s3_client: S3Client, sqs_client: SqsClient, zone_service: ZoneService, logger: logging.Logger):
        self._noaa_client = noaa_client
        self._dynamo_client = dynamo_client
        self._s3_client = s3_client
        self._sqs_client = sqs_client
        self._zone_service = zone_service
        self._logger = logger

    _alerts_table_name = "Alert"
    _weather_alerts_table_name = "WeatherAlert"
    _weather_alerts_bucket_name = "weather-alerts-bucket-202505"
    _weather_alerts_export_bucket_name = "weather-alerts-export-bucket-202505"
    _zones_coordinates_table_name = "ZoneCoordinates"
    _alerts_zone_name = "alerts-queue"

    async def get_and_store_active_alerts(self):
        alerts = await self._noaa_client.get_active_alerts()
        self._logger.info(f"Fetched {len(alerts)} alerts from NOAA API.")

        for alert in alerts:
            alert["id"]= alert.get("properties", {}).get("id", "")
            self._dynamo_client.upsert_item(self._alerts_table_name, alert)
            self._logger.info(f"Stored alert {alert.get('id')} in the database.")
            self._sqs_client.send_message(
                queue_name=self._alerts_zone_name,
                message_body={
                    "id": alert.get("id")
                }
            )
        self._logger.info(f"Sent {len(alerts)} alerts to SQS queue {self._alerts_zone_name}.")        
        return len(alerts)

    async def build_and_store_weather_alert(self, alert_id):
        logging.info(f"Building weather alert for ID: {alert_id}")
        alert = self._dynamo_client.get_item_by_id(self._alerts_table_name, alert_id)
        if not alert:
            print(f"Alert {alert_id} not found in table {self._alerts_table_name}")
            return

        affected_zone_ids = alert.get("properties", {}).get("affectedZones", [])
        if not affected_zone_ids:
            print(f"No zones found for alert {alert_id}")
            return

        zones = []
        for zone_id in affected_zone_ids:
            zone = self._zone_service.get_zone_coordinates_from_s3(zone_id)
            if zone:
                zones.append(zone)

        properties = alert.get("properties", {})

        alert_geometries = []
        min_lat = max_lat = min_lon = max_lon = None
        if alert.get("geometry"):
            alert_geometries.append(Geometry(type=alert.get("geometry").get("type", ""),coordinates=alert.get("geometry").get("coordinates", [])))
            min_lat, max_lat, min_lon, max_lon = self.get_min_max_lat_lon(alert.get("geometry").get("coordinates", []))

        for zone in zones:
            if zone and "geometry" in zone:
                geom = zone["geometry"]
                alert_geometries.append(
                    Geometry(
                        type=geom.get("type", ""),
                        coordinates=geom.get("coordinates", [])
                    )
                )
                # Calculate min/max lat/lon for this zone
                coords = geom.get("coordinates", [])
                if coords:
                    z_min_lat, z_max_lat, z_min_lon, z_max_lon = self.get_min_max_lat_lon(coords)
                    # Update overall min/max using Decimal
                    if z_min_lat is not None:
                        min_lat = Decimal(str(z_min_lat)) if min_lat is None else min(min_lat, Decimal(str(z_min_lat)))
                    if z_max_lat is not None:
                        max_lat = Decimal(str(z_max_lat)) if max_lat is None else max(max_lat, Decimal(str(z_max_lat)))
                    if z_min_lon is not None:
                        min_lon = Decimal(str(z_min_lon)) if min_lon is None else min(min_lon, Decimal(str(z_min_lon)))
                    if z_max_lon is not None:
                        max_lon = Decimal(str(z_max_lon)) if max_lon is None else max(max_lon, Decimal(str(z_max_lon)))

        weather_alert = WeatherAlert(
            id=alert.get("id", alert_id),
            start=datetime.fromisoformat(properties.get("effective")) if properties.get("effective") else None,
            end=datetime.fromisoformat(properties.get("ends")) if properties.get("ends") else None,
            updated=datetime.now(timezone.utc),
            severity=properties.get("severity", ""),
            event=properties.get("urgency", ""),
            title=properties.get("headline", ""),
            message=properties.get("description", ""),
            link=properties.get("@id", ""),
            geometry=alert_geometries,
            min_lat=min_lat,
            max_lat=max_lat,
            min_lon=min_lon,
            max_lon=max_lon
        )

        self._s3_client.put_object(
            bucket_name=self._weather_alerts_bucket_name,
            key=f"{weather_alert.id}.json",
            content=json.dumps(weather_alert.to_dict(), default=str, separators=(',', ':')).encode("utf-8")
        )

        self._dynamo_client.upsert_item(
            table_name=self._weather_alerts_table_name,
            item=weather_alert.to_dict(False)
        )
        logging.info(f"Stored weather alert {weather_alert.id} in S3 and DynamoDB.")

    def get_min_max_lat_lon(self, coordinates):
        def flatten_coords(coords):
            for c in coords:
                if isinstance(c, list) and len(c) == 2 and all(isinstance(x, (Decimal)) for x in c):
                    yield c
                elif isinstance(c, list):
                    yield from flatten_coords(c)

        if not coordinates:
            return None, None, None, None
        flat = list(flatten_coords(coordinates))
        if not flat:
            return None, None, None, None
        lats = [float(coord[1]) for coord in flat]
        lons = [float(coord[0]) for coord in flat]
        return min(lats), max(lats), min(lons), max(lons)
    
    def get_weather_alert(self, alert_id):
        alert = self._s3_client.get_object(
            bucket_name=self._weather_alerts_bucket_name,
            key=f"{alert_id}.json"
        )
        return WeatherAlert.from_dict(alert)
    
    def get_all_weather_alerts(self, include_coordinates=True):
        alerts = self._dynamo_client.get_all_items(self._weather_alerts_table_name)
        alerts = [WeatherAlert.from_dict(alert) for alert in alerts]
        if include_coordinates:
            alert_json = []
            self._logger.info("Fetching all weather alerts with coordinates.")
            for alert in alerts:
                alert_json.append(self.get_weather_alert(alert.id).to_dict())
            export_id = uuid.uuid4()

            export_url = self._s3_client.store_and_return_presigned_url(
                bucket_name=self._weather_alerts_export_bucket_name,
                key=f"{export_id}.json",
                content=json.dumps(alert_json, separators=(',', ':')).encode("utf-8")
            )

            return export_url            
        else:
            self._logger.info("Fetching all weather alerts without coordinates.")
            return alerts
    
    def get_weather_alerts_by_coords(self, coordinates):
        if not coordinates or len(coordinates) < 2:
            return []
        alerts = self.get_all_weather_alerts(False)

        alertids = set()
        alertjson = []

        for coord in coordinates:
            lat, lon = coord
                       
            for alert in alerts:
                if alert.min_lat <= Decimal(str(lat)) <= alert.max_lat and alert.min_lon <= Decimal(str(lon)) <= alert.max_lon:
                    alertids.add(alert.id)
        
        for alert_id in alertids:
            alertjson.append(self.get_weather_alert(alert_id).to_dict())

        export_id = uuid.uuid4()

        export_url = self._s3_client.store_and_return_presigned_url(
            bucket_name=self._weather_alerts_export_bucket_name,
            key=f"{export_id}.json",
            content=json.dumps(alertjson, separators=(',', ':')).encode("utf-8")
        )

        return export_url

    def remove_expired_alerts(self):
        current_time = datetime.now(timezone.utc)
        alerts = self.get_all_weather_alerts(False)

        expired_alerts = []
        for alert in alerts:
            if alert.end and alert.end < current_time:
                expired_alerts.append(alert)

        for alert in expired_alerts:
            self.delete_alert(alert.id)

        return len(expired_alerts)
    
    def delete_alert(self, alert_id):
        self._dynamo_client.delete_item(self._weather_alerts_table_name, alert_id)
        self._dynamo_client.delete_item(self._alerts_table_name, alert_id)
        self._s3_client.delete_object(self._weather_alerts_bucket_name, f"{alert_id}.json")
        self._logger.info(f"Deleted alert {alert_id} from DynamoDB and S3.")
        return True