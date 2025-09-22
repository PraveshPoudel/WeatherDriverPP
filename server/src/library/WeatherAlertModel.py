from typing import List, Any, Optional
from datetime import datetime
from decimal import Decimal

_precision = 5  

class Geometry:
    def __init__(self, type: str, coordinates: List[Any]):
        self.type = type
        self.coordinates = coordinates

    def round_value(self, value, precision=_precision):
        return round(Decimal(value), precision) if isinstance(value, (float, Decimal, int)) else value

    def round_coordinates(self):
        def round_item(item):
            if isinstance(item, float) or isinstance(item, Decimal):
                return self.round_value(item)
            elif isinstance(item, list):
                return [round_item(x) for x in item]
            else:
                return item
        self.coordinates = round_item(self.coordinates)

    def to_dict(self):
        return {
            "type": self.type,
            "coordinates": self.coordinates
        }

class WeatherAlert:
    def __init__(
        self,
        id: str,
        start: datetime,
        end: datetime,
        updated: datetime,
        severity: str,
        event: str,
        title: str,
        message: str,
        link: str,
        geometry: Optional[List[Geometry]] = None,
        min_lat: Optional[Decimal] = None,
        max_lat: Optional[Decimal] = None,
        min_lon: Optional[Decimal] = None,
        max_lon: Optional[Decimal] = None        
    ):
        self.id = id
        self.start = start
        self.end = end
        self.updated = updated
        self.severity = severity
        self.event = event
        self.title = title
        self.message = message
        self.link = link
        self.geometry = geometry or []
        self.min_lat = Decimal(str(min_lat)) if min_lat is not None else Decimal(0.0)
        self.max_lat = Decimal(str(max_lat)) if max_lat is not None else Decimal(0.0)
        self.min_lon = Decimal(str(min_lon)) if min_lon is not None else Decimal(0.0)
        self.max_lon = Decimal(str(max_lon)) if max_lon is not None else Decimal(0.0)

    def to_dict(self, include_geometry=True):
        # Round all geometry coordinates before serializing
        for g in self.geometry:
            if hasattr(g, "round_coordinates"):
                g.round_coordinates()
        result = {
            "id": self.id,
            "start": self.start.isoformat() if self.start else "",
            "end": self.end.isoformat() if self.end else "",
            "updated": self.updated.isoformat() if self.updated else "",
            "severity": self.severity,
            "event": self.event,
            "title": self.title,
            "message": self.message,
            "link": self.link,
            "min_lat": Geometry.round_value(self, self.min_lat),
            "max_lat": Geometry.round_value(self, self.max_lat),
            "min_lon": Geometry.round_value(self, self.min_lon),
            "max_lon": Geometry.round_value(self, self.max_lon)
        }
        if include_geometry:
            result["geometry"] = [g.to_dict() for g in self.geometry]
        return result

    @classmethod
    def from_dict(cls, data: dict):
        """
        Create a WeatherAlert from a dictionary, parsing dates and geometry.
        Expects geometry to be a list of dicts.
        """
        def parse_dt(val):
            if not val:
                return None
            if isinstance(val, datetime):
                return val
            # Try parsing ISO 8601
            try:
                return datetime.fromisoformat(val)
            except Exception:
                return None

        geometry_objs = []
        geometry = data.get("geometry")
        if geometry and isinstance(geometry, list):
            for g in geometry:
                if isinstance(g, Geometry):
                    geometry_objs.append(g)
                elif isinstance(g, dict):
                    geometry_objs.append(
                        Geometry(
                            type=g.get("type"),
                            coordinates=g.get("coordinates")
                        )
                    )

        return cls(
            id=data.get("id"),
            start=parse_dt(data.get("start")),
            end=parse_dt(data.get("end")),
            updated=parse_dt(data.get("updated")),
            severity=data.get("severity"),
            event=data.get("event"),
            title=data.get("title"),
            message=data.get("message"),
            link=data.get("link"),
            geometry=geometry_objs,
            min_lat=data.get("min_lat"),
            max_lat=data.get("max_lat"),
            min_lon=data.get("min_lon"),
            max_lon=data.get("max_lon"),
        )