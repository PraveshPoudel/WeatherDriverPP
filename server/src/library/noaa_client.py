from http_client import HttpClient

NOAA_BASE_URL = "https://api.weather.gov/"
NOAA_ALERTS_URL = f"{NOAA_BASE_URL}alerts/active"
NOAA_ZONES_URL = f"{NOAA_BASE_URL}zones"

class NoaaClient:
    def __init__(self, http_client: HttpClient):
        self.http_client = http_client

    async def get_active_alerts(self):
        raw_json = await self.http_client.get_json(NOAA_ALERTS_URL)
        return raw_json.get('features', [])

    async def get_all_zones(self):
        raw_json = await self.http_client.get_json(NOAA_ZONES_URL)
        return raw_json.get('features', [])

    async def get_zone_coordinates(self, zone_id: str):
        url = f"{NOAA_ZONES_URL}/{zone_id}"
        return await self.http_client.get_json(url)
