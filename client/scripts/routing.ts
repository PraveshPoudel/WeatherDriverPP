import { LatLng } from 'react-native-maps';
import * as turf from '@turf/turf';

// Function to convert an array of LatLng to a GeoJSON LineString
function latLngsToLineString(latLngArray: LatLng[]): GeoJSON.Feature<GeoJSON.LineString> {
  // Convert LatLng array to the format expected by Turf.js (array of [longitude, latitude])
  const coordinates: [number, number][] = latLngArray.map(({ latitude, longitude }) => [longitude, latitude]);

  // Create a LineString feature using Turf.js
  return turf.lineString(coordinates);
}

// Helper function to convert LatLng[] to an array of coordinates suitable for turf.polygon
function latLngsToPolygon(coordinates: LatLng[]): GeoJSON.Feature<GeoJSON.Polygon> {
  return turf.polygon([coordinates.map(coord => [coord.longitude, coord.latitude])]);
}

// Function to convert GeoJSON LineString back to LatLng array
function lineStringToLatLngs(lineString: GeoJSON.Feature<GeoJSON.LineString>): { latitude: number, longitude: number }[] {
  return lineString.geometry.coordinates.map((position: GeoJSON.Position) => ({
    latitude: position[1],
    longitude: position[0]
  }));
}

// Function to simplify the polygon to a specified number of points
function simplifyPolygon(points: LatLng[], numPoints: number): LatLng[] {
  if (points.length <= numPoints) {
    return points; // No need to simplify if already within the limit
  }

  const lineString = latLngsToLineString(points);

  let tolerance = 0.001; // Initial tolerance value
  let simplifiedLineString = turf.simplify(lineString, { tolerance });


  // Adjust tolerance until the number of points is less than or equal to numPoints
  while (simplifiedLineString && simplifiedLineString.geometry.coordinates.length > numPoints && tolerance < 1) {
    tolerance += 0.001;
    simplifiedLineString = turf.simplify(lineString, { tolerance });
  }

  if (!simplifiedLineString || !simplifiedLineString.geometry.coordinates) {
    throw new Error('Simplified LineString is invalid');
  }

  return lineStringToLatLngs(simplifiedLineString);
}

function findClosestEntryExit(routeCoordinates: LatLng[], polygonCoordinates: LatLng[]) {
  // Create a clone of polygonCoordinates to avoid modifying the original array
  let modifiedPolygonCoordinates = [...polygonCoordinates];

  // Turf expects the polygon to be closed, so we need to close it if it's not already
  if (!pointsAreEqual(modifiedPolygonCoordinates[0], modifiedPolygonCoordinates[modifiedPolygonCoordinates.length - 1])) {
    modifiedPolygonCoordinates.push(modifiedPolygonCoordinates[0]);
  }

  const routeLine = latLngsToLineString(routeCoordinates);
  const polygon = latLngsToPolygon(modifiedPolygonCoordinates);

  // Ensure the polygon is correctly oriented
  const orientedPolygon = turf.rewind(polygon, { reverse: false }) as GeoJSON.Feature<GeoJSON.LineString>;

  let entryPoint: LatLng = {
    latitude: 0,
    longitude: 0
  };
  let exitPoint: LatLng = {
    latitude: 0,
    longitude: 0
  };

  // Find intersection points
  const intersections = turf.lineIntersect(routeLine, orientedPolygon);

  if (intersections.features.length > 0) {
    entryPoint = arrayToLatLng(intersections.features[0].geometry.coordinates);
    exitPoint = arrayToLatLng(intersections.features[intersections.features.length - 1].geometry.coordinates);
  }

  return { entryPoint, exitPoint };
}

// Function to convert a number[] to a LatLng object
function arrayToLatLng(coordinates: number[]): LatLng {
  return { latitude: coordinates[1], longitude: coordinates[0] };
}

function getShortestRoute(start: LatLng, end: LatLng, polygon: LatLng[]): LatLng[] {
  // Convert inputs to Turf.js compatible formats
  const startPoint = turf.point([start.longitude, start.latitude]);
  const endPoint = turf.point([end.longitude, end.latitude]);
  const polygonLine = latLngsToLineString(polygon);

  // Get the index of the nearest points on the polygon
  const startIndex = turf.nearestPointOnLine(polygonLine, startPoint).properties.index;
  const endIndex = turf.nearestPointOnLine(polygonLine, endPoint).properties.index;

  if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find nearest points on the polygon");
    return [];
  }

  // Create two possible routes around the polygon
  let route1: LatLng[];
  let route2: LatLng[];

  if (startIndex < endIndex) {
    route1 = polygon.slice(startIndex, endIndex + 1);
    route2 = [...polygon.slice(endIndex), ...polygon.slice(0, startIndex + 1)];
  } else {
    route1 = [...polygon.slice(startIndex), ...polygon.slice(0, endIndex + 1)];
    route2 = polygon.slice(endIndex, startIndex + 1);
  }

  // Calculate distances of both routes
  const distance1 = turf.length(latLngsToLineString(route1));
  const distance2 = turf.length(latLngsToLineString(route2));

  // Return the shorter route
  return distance1 < distance2 ? route1 : route2;
}

export function getWaypoints(polyline: LatLng[], polygon: LatLng[]) {
  // Find the entry and exit points on the polygon
  let { entryPoint, exitPoint } = findClosestEntryExit(polyline, polygon);

  // Get the entry, exit, and polygon points in-between them
  let pointsBetween = getShortestRoute(entryPoint, exitPoint, polygon);

  // Simplify to a maximum of 10 points
  pointsBetween = simplifyPolygon(pointsBetween, 10);

  // Scale up the points by a factor of 1.5 to avoid picking routes too close to the polygon
  let lineStringPointsBetween = turf.transformScale(latLngsToLineString(pointsBetween), 2);

  // Convert the points from a lineString back into LatLng array
  pointsBetween = lineStringToLatLngs(lineStringPointsBetween);

  pointsBetween.shift();
  pointsBetween.pop();

  return pointsBetween;
}

export function doesPolylineIntersectPolygon(polyline: LatLng[], polygon: LatLng[]): boolean {
  if (polygon.length < 3 || polyline.length === 0) {
    // A polygon must have at least 3 vertices
    // A polyline must have at least 1 vertex to be workable
    return false;
  }

  // Convert the polygon points to a closed Polygon
  const closedPolygonPoints = [...polygon, polygon[0]];
  const polygonFeature = turf.polygon([closedPolygonPoints.map(latLng => [latLng.longitude, latLng.latitude])]);

  // LineString requires at least 2 vertices
  if (polyline.length === 1) {
    polyline.push(polyline[0]);
  }
  // Convert the line points to a LineString
  const lineString = turf.lineString(polyline.map(latLng => [latLng.longitude, latLng.latitude]));
  // Use booleanIntersects to check for intersection
  return turf.booleanIntersects(lineString, polygonFeature);
}

// Helper function to check if two LatLng points are equal
function pointsAreEqual(point1: LatLng, point2: LatLng, tolerance: number = 1e-5): boolean {
  return Math.abs(point1.latitude - point2.latitude) < tolerance &&
    Math.abs(point1.longitude - point2.longitude) < tolerance;
}