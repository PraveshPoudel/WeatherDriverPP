export interface Geometry {
  type: string;
  coordinates: number[][][];
}

export interface WeatherAlert {
  id: string;
  start: string;
  end: string;
  updated: string;
  severity: string;
  event: string;
  title: string;
  message: string;
  link: string;
  geometry: Geometry[];
  min_lat: number;
  max_lat: number;
  min_lon: number;
  max_lon: number;
}

export interface AlertSummary {
  id: string;
  title: string;
  severity: string;
  event?: string;
  expires?: string;
}
