import httpx
import json
from typing import Optional, Dict
from decimal import Decimal

class HttpClient:
    def __init__(self, timeout: float = 30.0):
        self._client = httpx.AsyncClient(timeout=timeout)

    async def get_json(self, endpoint: str, headers: Optional[Dict[str, str]] = None) -> dict:
        starting_headers = self._client.headers.copy()
        if headers:
            starting_headers.update(headers)

        response = await self._client.get(endpoint, headers=starting_headers)
        response.raise_for_status()
        return json.loads(response.text, parse_float=Decimal)

    async def close(self):
        await self._client.aclose()