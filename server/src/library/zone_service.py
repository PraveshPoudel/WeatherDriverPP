import logging
from noaa_client import NoaaClient
from dynamo_client import DynamoDbClient
from sqs_client import SqsClient
from s3_client import S3Client
from decimal import Decimal
import simplejson as json

_precision = 5

def round_value(value, precision=_precision):
    return round(Decimal(value), precision) if isinstance(value, (float, Decimal, int)) else value

def round_coordinates(coordinates):
    def round_item(item):
        if isinstance(item, float) or isinstance(item, Decimal):
            return round_value(item)
        elif isinstance(item, list):
            return [round_item(x) for x in item]
        else:
            return item
    return round_item(coordinates)


class ZoneService:
    def __init__(self, noaa_client: NoaaClient, dynamo_client: DynamoDbClient, sqs_client: SqsClient, s3_client: S3Client, logger: logging.Logger):
        self._noaa_client = noaa_client
        self._dynamo_client = dynamo_client
        self._sqs_client = sqs_client
        self._s3_client = s3_client
        self._logger = logger

    _zones_table_name = "Zone"
    _zones_queue_name = "zones-queue"
    _zones_coordinates_bucket_name = "zone-bucket-202505"

    async def get_and_store_all_zones(self):
        zones = await self._noaa_client.get_all_zones()

        zone_count = 0
        
        for zone in zones:
            zone = zone.get("properties", {})
            zone["id"] = zone.get("@id")
            self._dynamo_client.upsert_item(self._zones_table_name, zone)
            self._sqs_client.send_message(
                queue_name=self._zones_queue_name,
                message_body={
                    "id": zone.get("id")
                }
            )
            self._logger.info(f"Stored zone {zone.get('id')} in the database.")
            zone_count += 1

        self._logger.info(f"Fetched {len(zones)} zones from NOAA API.")
        self._logger.info(f"Total zones stored: {zone_count}")
        return

    async def get_and_store_zone_coordinates(self, zone_id):
        zone_coordinates = await self.get_zone_coordinates_from_noaa(zone_id)

        self.store_zone_coordinates_in_s3(zone_id, zone_coordinates)

        self._logger.info(f"Retrieved and stored zone {zone_id} in S3.")

        return


    async def get_zone_coordinates_from_noaa(self, zone_id):
        if zone_id.startswith("https://api.weather.gov/zones/"):
            zone_id = zone_id.replace("https://api.weather.gov/zones/", "")

        zone_coordinates = await self._noaa_client.get_zone_coordinates(zone_id)

        return zone_coordinates
    
    
    def get_zone_coordinates_from_s3(self, zone_id):
        zone_file_name = self.format_s3_file_name(zone_id)

        zone_coordinates = self._s3_client.get_object(self._zones_coordinates_bucket_name, zone_file_name)

        self._logger.info(f"Retrieved zone {zone_id} from S3.")

        return zone_coordinates
    

    def store_zone_coordinates_in_s3(self, zone_id, zone):
        zone_file_name = self.format_s3_file_name(zone_id)

        geometry = zone.get("geometry", {})
        if "coordinates" in geometry:
            geometry["coordinates"] = round_coordinates(geometry["coordinates"])
            zone["geometry"] = geometry
        
        zone_coordinates = self._s3_client.put_object(self._zones_coordinates_bucket_name, 
                                                      zone_file_name, 
                                                      json.dumps(zone, use_decimal=True, separators=(",", ":"))
                                                      .encode("utf-8"))

        self._logger.info(f"Stored zone {zone_id} in S3.")

        return zone_coordinates
    

    def format_s3_file_name(self, zone_id):
        if zone_id.startswith("https://api.weather.gov/zones/"):
            zone_id = zone_id.replace("https://api.weather.gov/zones/", "")
        zone_id = zone_id.replace("/", "-")
        return (f"{zone_id}.json")