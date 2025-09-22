import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Alert, Keyboard, Text, TouchableOpacity } from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Polyline,
  Polygon,
  LatLng,
  MapPressEvent,
  PolygonPressEvent,
  MapMarker,
} from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import polyline from "@mapbox/polyline";
import { Colors } from "@/constants/Colors";
import AddressInput from "@/components/AddressInput";
import { StatusBar } from "expo-status-bar";
import moment from "moment";
import AppButton from "@/components/AppButton";
import { getWaypoints, doesPolylineIntersectPolygon } from "../../scripts/routing"
import hexToRgba from "@/scripts/color";
import { FontAwesome, FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Geometry {
  type: string;
  coordinates: number[][][];
}

interface WeatherAlert {
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

interface AlertGroup {
  title: string;
  polygons: LatLng[][];
  min_lat: number;
  max_lat: number;
  min_lon: number;
  max_lon: number;
  strokeColor: string;
  fillColor: string;
}

interface Leg {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number
  };
}

interface Route {
  overview_polyline: {
    points: string;
  };
  legs: Leg[];
}

export default function Map() {
  const router = useRouter();
  const weatherAlertData = require("../../assets/data/all_weather_alerts.json");
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [expanded, setExpanded] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [route, setRoute] = useState<LatLng[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [selectedInput, setSelectedInput] = useState<
    "origin" | "destination" | null
  >(null);
  const [destinationMarker, setDestinationMarker] = useState<LatLng | null>(
    null
  );
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("-");
  const [milesRemaining, setMilesRemaining] = useState<string>("-");
  const [arrivalTime, setArrivalTime] = useState<string>("-");
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [alertGroups, setAlertGroups] = useState<AlertGroup[]>([]);
  const [waypoints, setWaypoints] = useState<LatLng[]>([]);
  const [mapPadding, setMapPadding] = useState<{
    paddingTop: number;
    paddingBottom: number;
  }>({
    paddingTop: 75,
    paddingBottom: 130,
  });
  const [saveRoute, setSaveRoute] = useState<boolean>(true);
  const mapViewRef = useRef<MapView | null>(null);
  const [addStops, setAddStops] = useState<boolean>(false);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [infoBoxPosition, setInfoBoxPosition] = useState<LatLng | null>(null);
  const [infoBoxTitle, setInfoBoxTitle] = useState<string | null>(null);
  const markerRef = useRef<MapMarker | null>(null);

  useEffect(() => {
    setWeatherAlerts(weatherAlertData.alerts as WeatherAlert[]);

    // Get the route from async storage if it was saved
    const loadRoute = async () => {
      try {
        const savedRoute = await AsyncStorage.getItem('route');
        if (savedRoute !== null) {
          setRoute(JSON.parse(savedRoute));
        }
      } catch (error) {
        console.error('Error loading route:', error);
      }
    };

    loadRoute();

    // Setup location updates to watch device location
    const getLocationUpdates = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }

        // Subscribe to location updates
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Minimum time between updates in milliseconds
            distanceInterval: 5, // Minimum change in distance to trigger an update in meters
          },
          (newLocation) => {
            setLocation(newLocation);
          }
        );

        // Clean up the subscription when the component unmounts
        return () => {
          subscription.remove();
        };
      } catch (error) {
        console.error(error);
      }
    };

    getLocationUpdates();
  }, []);

  // Check if the device location intersects an alert
  useEffect(() => {
    const checkIntersection = async () => {
      if (location) {
        const intersection: AlertGroup | null = await handleIntersections([{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }], false);
        if (intersection != null) {
          showAlert(intersection, false);
        }
      }
    };

    checkIntersection();
  }, [location]);

  // Move the camera when a route is created or changes
  useEffect(() => {
    if (route && route.length > 0) {
      // Fit the map to the route coordinates
      mapViewRef.current?.fitToCoordinates(route, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });

      // Move the camera to the last point of the route
      const lastPoint = route[route.length - 1];
      mapViewRef.current?.animateCamera({
        center: lastPoint,
      }, { duration: 1000 });
    }
  }, [route]);

  // Convert weather alert data to workable alert groups
  useEffect(() => {
    convertToAlertGroups(weatherAlerts);
  }, [weatherAlerts]);

  // Update map padding when either menu resizes
  useEffect(() => {
    const newPaddingTop = expanded ? 130 : 75;
    const newPaddingBottom = showMenu ? 130 : 0;
    setMapPadding({
      paddingTop: newPaddingTop,
      paddingBottom: newPaddingBottom,
    });
  }, [expanded, showMenu]);

  // Use useEffect to show the callout when the component mounts
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.showCallout();
    }
  }, [infoBoxPosition]);

  const calculateArrivalTime = (
    departureTime: moment.MomentInput,
    duration: moment.DurationInputArg1
  ) => {
    return moment(departureTime).add(duration, "seconds").format("hh:mm A");
  };

  function convertToLatLng(coordinates: number[][]): LatLng[] {
    return coordinates.map((coord) => ({
      latitude: coord[1] != null ? coord[1] : 0,
      longitude: coord[0] != null ? coord[0] : 0,
    }));
  }

  function convertToAlertGroups(weatherAlerts: WeatherAlert[]) {
    let newAlertGroups: AlertGroup[] = [];
    weatherAlerts.forEach((weatherAlert) => {
      // Do not include warnings intended for air craft
      let weatherAlertTitle = weatherAlert.title ?? '';
      if (!weatherAlertTitle.includes("Craft") && !weatherAlertTitle.includes("Gale")) {
        let alertGroup: AlertGroup = {
          title: weatherAlert.title,
          polygons: [],
          min_lat: 0,
          max_lat: 0,
          min_lon: 0,
          max_lon: 0,
          strokeColor: getSeverityColor(weatherAlert.severity),
          fillColor: getSeverityColor(weatherAlert.severity, 0.2),
        };
        weatherAlert.geometry.forEach((geometry) => {
          if (geometry.coordinates && Array.isArray(geometry.coordinates)) {
            geometry.coordinates.forEach((polygon) => {
              if (Array.isArray(polygon) && polygon.length > 0) {
                const validPolygon = polygon.filter(
                  (coord) =>
                    coord.length === 2 &&
                    typeof coord[0] === "number" &&
                    typeof coord[1] === "number"
                );
                const convertedPolygon = convertToLatLng(validPolygon);
                if (convertedPolygon.length > 0) {
                  alertGroup.polygons.push(convertedPolygon);
                  alertGroup.min_lat = Math.min(...convertedPolygon.map(location => location.latitude));
                  alertGroup.max_lat = Math.max(...convertedPolygon.map(location => location.latitude));
                  alertGroup.min_lon = Math.min(...convertedPolygon.map(location => location.longitude));
                  alertGroup.max_lon = Math.max(...convertedPolygon.map(location => location.longitude));
                }
              }
            });
          }
        });
        if (alertGroup.polygons.length > 0) {
          newAlertGroups.push(alertGroup);
        }
      }
    });
    setAlertGroups(newAlertGroups);
  }

  // Function to get the severity color with opacity
  const getSeverityColor = (severity: string, opacity: number = 1): string => {
    let colorHex: string;

    switch (severity) {
      case "Minor":
        colorHex = Colors.alertMinor;
        break;
      case "Moderate":
        colorHex = Colors.alertModerate;
        break;
      case "Severe":
        colorHex = Colors.alertSevere;
        break;
      default:
        colorHex = Colors.alertUnknown;
        break;
    }

    return hexToRgba(colorHex, opacity);
  };

  const isCoordinateInBoundingBox = (
    coordinate: LatLng,
    weatherAlert: AlertGroup
  ): boolean => {
    return (
      coordinate.latitude >= weatherAlert.min_lat &&
      coordinate.latitude <= weatherAlert.max_lat &&
      coordinate.longitude >= weatherAlert.min_lon &&
      coordinate.longitude <= weatherAlert.max_lon
    );
  };

  const getDirections = async (checkIntersection: boolean = true) => {
    if (location && destination) {
      try {
        const originOrLocation = await getOriginOrLocation();
        const url = buildDirectionsUrl(originOrLocation, waypoints);

        const response = await axios.get<{
          status: string; routes: Route[]
        }>(url);

        if (response.data.status === "OK") {

          const routeData = parseRouteData(response.data.routes[0]);
          setRoute(routeData.formattedPoints);
          setDestinationMarker(routeData.destinationMarker);
          updateTravelInfo(routeData.leg);
          Keyboard.dismiss();
          setExpanded(true);
          setShowMenu(true);

          if (checkIntersection) {
            await handleIntersections(routeData.formattedPoints);
          }
        } else {
          handleError("Could not find route");
        }
      } catch (error) {
        console.error(error);
        handleError("An error occurred while fetching directions");
      }
    }
  };

  // Save or remove route from AsyncStorage
  const toggleRoute = async () => {
    if (route.length > 0) {
      if (saveRoute) {
        try {
          await AsyncStorage.setItem('route', JSON.stringify(route));
          console.log('Success saving route:', route);
        } catch (error) {
          console.error('Error saving route:', error);
        }
      } else {
        try {
          await AsyncStorage.removeItem('route');
          console.log(`Removed item with key: ${route}`);
        } catch (error) {
          console.error('Error removing item from AsyncStorage', error);
        }
      }
      setSaveRoute(prevState => !prevState);
    }
  };

  const getOriginOrLocation = async (): Promise<string> => {
    if (origin) {
      return origin;
    } else if (location) {
      return await fetchAddressFromCoordinates(location.coords.latitude, location.coords.longitude);
    }
    throw new Error("No origin or location provided");
  };

  const buildDirectionsUrl = (originOrLocation: string, waypointsParam: LatLng[]): string => {
    // URL-encode the origin, destination, and later the waypoints
    const encodedOrigin = encodeURIComponent(originOrLocation);
    const encodedDestination = encodeURIComponent(destination);

    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodedOrigin}&destination=${encodedDestination}&key=${GOOGLE_MAPS_API_KEY}`;

    if (waypointsParam.length > 0) {
      const waypointsString = waypointsParam.map(waypoint => `${waypoint.latitude},${waypoint.longitude}`).join('|');
      url = url.concat(`&waypoints=optimize:true|${encodeURIComponent(waypointsString)}`);
    }

    return url;
  };

  const parseRouteData = (route: Route): { formattedPoints: LatLng[], destinationMarker: LatLng, leg: Leg } => {
    const points = polyline.decode(route.overview_polyline.points);
    const formattedPoints: LatLng[] = points.map(([lat, lng]: [number, number]) => ({ latitude: lat, longitude: lng }));
    const destinationMarker: LatLng = formattedPoints[formattedPoints.length - 1];
    const leg: Leg = route.legs[0];

    return { formattedPoints, destinationMarker, leg };
  };

  const updateTravelInfo = (leg: Leg): void => {
    setMilesRemaining(leg.distance.text);
    setTimeRemaining(leg.duration.text);
    const durationInSeconds = leg.duration.value;
    const departureTime = new Date();
    setArrivalTime(calculateArrivalTime(departureTime, durationInSeconds));
  };

  const handleIntersections = async (formattedPoints: LatLng[], updateWaypoints: boolean = true): Promise<AlertGroup | null> => {
    for (const alertGroup of alertGroups) {
      // Check if any point in the route intersects with the bounding box of the alert group
      const intersectsBoundingBox = formattedPoints.some((coordinate: LatLng) => {
        return isCoordinateInBoundingBox(coordinate, alertGroup);
      });

      if (intersectsBoundingBox) {
        console.log(`Route intersects with bounding box of alert: ${alertGroup.title}`);

        for (const polygon of alertGroup.polygons) {
          if (polygon && polygon !== undefined) {
            const doesIntersect = doesPolylineIntersectPolygon(formattedPoints, polygon);
            if (doesIntersect) {
              console.log(`Route intersects with polygon of alert: ${alertGroup.title}`);
              if (updateWaypoints) {
                // Set waypoints and mark as intersecting
                const waypointCoordinates = getWaypoints(formattedPoints, polygon);
                const waypointPromises = waypointCoordinates.map(async waypoint => {
                  return await getNearestRoadCoordinates(waypoint);
                });

                const waypointRoads = await Promise.all(waypointPromises);
                setWaypoints(waypointRoads);
                showAlert(alertGroup);
              }
              return alertGroup; // Exit the loop if an intersection is found
            }
          }
        }
      }
    }
    return null;
  };

  const showAlert = (alertGroup: AlertGroup, showReroute: boolean = true): void => {
    if (!isAlertActive) {
      setIsAlertActive(true);
      if (showReroute) {
        Alert.alert(
          "Hazardous Conditions Present",
          `${alertGroup.title}`,
          [
            {
              text: "Reroute",
              onPress: async () => {
                await getDirections(false);
              },
            },
            {
              text: "Continue",
              onPress: () => { },
            },
            {
              text: "Remove",
              onPress: () => setRoute([]),
            }
          ],
          { onDismiss: () => setIsAlertActive(false) }
        );
      } else {
        Alert.alert(
          "Hazardous Conditions Present",
          `${alertGroup.title}`,
          [
            {
              text: "Continue",
              onPress: () => { },
            },
          ],
          { onDismiss: () => setIsAlertActive(false) }
        );
      }
    }
  }

  const handleError = (message: string): void => {
    console.error(message);
  };

  const handleMapPress = async (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    // Check if the user is adding stops
    if (addStops) {
      setWaypoints(prevWaypoints => {
        const newWaypoints = [...prevWaypoints, { latitude, longitude }];

        // Prevent more than 10 waypoints being present at a time to reduce Google Directions API costs
        if (newWaypoints.length > 10) {
          return newWaypoints.slice(1);
        }

        return newWaypoints;
      });

    } else {
      if (selectedInput) {
        try {
          const address = await fetchAddressFromCoordinates(latitude, longitude);
          if (selectedInput === "origin") {
            setOrigin(address);
          } else if (selectedInput === "destination") {
            setDestination(address);
          }
        } catch (error) {
          console.error(error);
          Alert.alert("Error", "An error occurred while fetching address");
        }
        setSelectedInput(null);
      }
    }
  };

  async function getNearestRoadCoordinates(point: LatLng): Promise<LatLng> {
    const server = 'https://router.project-osrm.org';
    const profile = 'driving';
    const coordinates = `${point.longitude},${point.latitude}`;
    const number = 1; // Number of nearest points to return

    const url = `${server}/nearest/v1/${profile}/${coordinates}?number=${number}`;

    try {
      const response = await axios.get(url);

      if (response.data.code === 'Ok' && response.data.waypoints.length > 0) {
        const snappedLocation = response.data.waypoints[0].location;
        return { latitude: snappedLocation[1], longitude: snappedLocation[0] };
      } else {
        throw new Error('No waypoints found in the response');
      }
    } catch (error) {
      console.error('Error snapping point to nearest road:', error);
      throw error;
    }
  }

  const fetchAddressFromCoordinates = async (
    latitude: number,
    longitude: number,
    preferAddress: boolean = true
  ): Promise<string> => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      if (response.data.status === "OK" && response.data.results.length > 0) {
        const result = response.data.results[0];

        if (result.formatted_address && preferAddress) {
          return result.formatted_address;
        } else if (response.data.plus_code.compound_code) {
          return response.data.plus_code.compound_code;
        } else {
          throw new Error("No address or plus code found");
        }
      } else {
        throw new Error("Could not fetch address");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      throw error;
    }
  };

  const moveToMarker = () => {
    if (mapViewRef.current && destinationMarker) {
      mapViewRef.current.animateCamera({
        center: {
          latitude: destinationMarker.latitude,
          longitude: destinationMarker.longitude,
        },
      }, { duration: 1000 });
    };
  }

  const moveToStart = () => {
    if (mapViewRef.current && route.length > 0) {
      // Move the camera to the first point of the route
      const firstPoint = route[0];
      mapViewRef.current.animateCamera({
        center: firstPoint,
      }, { duration: 1000 });
    };
  }

  function formatLatLng(latLng: LatLng): string {
    const { latitude, longitude } = latLng;

    const latDirection = latitude >= 0 ? 'N' : 'S';
    const lonDirection = longitude >= 0 ? 'E' : 'W';

    // Format the latitude and longitude to 5 decimal places
    const formattedLatitude = Math.abs(latitude).toFixed(5);
    const formattedLongitude = Math.abs(longitude).toFixed(5);

    return `${formattedLatitude}° ${latDirection}, ${formattedLongitude}° ${lonDirection}`;
  }

  const handlePolygonPress = async (event: PolygonPressEvent, alertIndex: number) => {
    if (event.nativeEvent.coordinate) {
      const pressCoordinate: LatLng = event.nativeEvent.coordinate;
      setInfoBoxPosition(pressCoordinate);
      setInfoBoxTitle(alertGroups[alertIndex].title)
    }
  };

  const closeInfoBox = async () => {
    setInfoBoxPosition(null);
    setInfoBoxTitle(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {location && (
        <MapView
          ref={mapViewRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 1,
            longitudeDelta: 1,
          }}
          showsCompass={true}
          showsTraffic={true}
          pitchEnabled={true}
          zoomEnabled={true}
          showsBuildings={true}
          showsUserLocation={true}
          showsMyLocationButton={true}
          mapPadding={{
            top: mapPadding.paddingTop,
            bottom: mapPadding.paddingBottom,
            left: 0,
            right: 0,
          }}
          onPress={handleMapPress}
        >
          {alertGroups.length > 0 && (
            <>
              {alertGroups.map(
                (alert, alertIndex) =>
                  alert.polygons.length > 0 &&
                  alert.polygons.map(
                    (polygon, polygonIndex) =>
                      polygon.length > 0 && (
                        <Polygon
                          key={`${alertIndex}-${polygonIndex}`}
                          coordinates={polygon}
                          tappable={true}
                          onPress={(event) => handlePolygonPress(event, alertIndex)}
                          strokeColor={alert.strokeColor}
                          fillColor={alert.fillColor}
                          strokeWidth={1}
                        />
                      )
                  )
              )}
            </>
          )}
          {route.length > 0 && (
            <>
              <Polyline
                coordinates={route}
                strokeColor={Colors.routeOutside}
                strokeWidth={10}
              />
              <Polyline
                coordinates={route}
                strokeColor={Colors.routeInside}
                strokeWidth={5}
              />
            </>
          )}
          {destinationMarker && (
            <Marker
              coordinate={destinationMarker}
              title="Destination"
              description={`Your destination is here.`}
            />
          )}
          {addStops && waypoints.length > 0 && (
            waypoints.map((coordinates, index) => (
              <Marker
                key={index}
                coordinate={coordinates}
                title={`Stopping Point #${index + 1}`}
                description={`${formatLatLng(coordinates)}`}
              />
            ))
          )}
          {infoBoxPosition && infoBoxTitle && (
            <Marker coordinate={infoBoxPosition} title="Alert" description={infoBoxTitle} ref={markerRef} onPress={closeInfoBox} />
          )}
        </MapView>
      )}
      <View style={styles.inputContainer}>
        {expanded && (
          <View style={styles.inputRow}>
            <TouchableOpacity onPress={() => moveToStart()} style={styles.icon} >
              <FontAwesome name="dot-circle-o" size={24} color={Colors.locationDot} />
            </TouchableOpacity>
            <AddressInput
              inputStyle={styles.input}
              placeholder="Your Location"
              value={origin}
              onChangeText={setOrigin}
              onFocus={() => {
                setSelectedInput("origin");
                setShowMenu(false);
              }}
              onBlur={() => {
                setSelectedInput(null);
                setShowMenu(true);
              }} />
            <TouchableOpacity onPress={() => {
              // Swap the origin and destination addresses
              let prevOrigin = origin;
              setOrigin(destination);
              setDestination(prevOrigin);
            }} style={styles.icon} >
              <MaterialCommunityIcons name="swap-vertical-bold" size={24} color={Colors.bold} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputRow}>
          <TouchableOpacity onPress={() => moveToMarker()} style={styles.icon} >
            <FontAwesome6 name="location-dot" size={24} color={Colors.destinationMarker} />
          </TouchableOpacity>
          <AddressInput
            inputStyle={[styles.input, styles.inputBottom]}
            placeholder="Your Destination"
            value={destination}
            onChangeText={setDestination}
            onFocus={() => {
              setSelectedInput("destination");
              setShowMenu(false);
            }}
            onBlur={() => {
              setSelectedInput(null);
              setShowMenu(true);
            }}
          />
          <TouchableOpacity onPress={() => router.navigate("/(tabs)/settings")} style={styles.icon} >
            <MaterialCommunityIcons name="cog" size={24} color={Colors.bold} />
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={
          showMenu
            ? styles.menuContainer
            : [styles.menuContainer, styles.menuCollapsed]
        }
      >
        <View style={styles.menuHeader}>
          <View style={styles.timeMilesContainer}>
            {showMenu && (
              <>
                <Text style={styles.timeRemaining}>Drive {timeRemaining}</Text>
                <Text style={styles.milesRemaining}>({milesRemaining})</Text>
              </>
            )}
          </View>
          <AppButton
            title=""
            iconName={showMenu ? "chevron-down" : "chevron-up"}
            iconSize={20}
            buttonStyle={styles.closeButton}
            onPress={() => setShowMenu((prevCheck) => !prevCheck)}
          />
        </View>
        {showMenu && (
          <>
            <Text style={styles.arrivalTime}>Arrival {arrivalTime}</Text>
            <View style={styles.buttonContainer}>
              <AppButton
                title="Start"
                iconName="navigate"
                iconSize={20}
                buttonStyle={styles.buttonBottom}
                textStyle={styles.buttonBottomText}
                onPress={getDirections}
              />
              <AppButton
                title="Add Stops"
                iconName="location"
                iconColor={addStops ? Colors.background : Colors.regular}
                iconSize={20}
                buttonStyle={[styles.buttonBottom, styles.buttonRight, (addStops && styles.activeButton)]}
                textStyle={[styles.buttonBottomText, addStops ? styles.buttonTextRightActive : styles.buttonTextRight]}
                onPress={() => {
                  setAddStops(prevValue => !prevValue);
                  if (addStops) {
                    setWaypoints([]);
                  }
                }}
              />
              <AppButton
                title="Save"
                iconName="bookmark"
                iconColor={Colors.regular}
                iconSize={20}
                buttonStyle={[styles.buttonBottom, styles.buttonRight]}
                textStyle={[styles.buttonBottomText, styles.buttonTextRight]}
                onPress={() => toggleRoute()}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  inputContainer: {
    backgroundColor: Colors.background,
    alignSelf: "center",
    margin: 10,
    borderRadius: 10,
    width: "95%",
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    margin: 10,
    paddingTop: 10,
    alignSelf: 'flex-start',
  },
  input: {
    marginTop: 10,
    fontSize: 16,
    width: 310,
  },
  inputBottom: {
    marginBottom: 10,
  },
  menuContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 15,
    margin: 10,
  },
  menuCollapsed: {
    maxWidth: "20%",
    left: 330,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeMilesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeRemaining: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.bold,
  },
  milesRemaining: {
    fontSize: 16,
    marginLeft: 10,
    color: Colors.regular,
  },
  arrivalTime: {
    fontSize: 16,
    marginTop: 0,
    color: Colors.regular,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  buttonBottom: {
    borderRadius: 100, // Circular
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  activeButton: {
    backgroundColor: Colors.bold,
  },
  buttonBottomText: {
    fontSize: 14,
  },
  buttonRight: {
    backgroundColor: Colors.secondary,
  },
  buttonTextRight: {
    color: Colors.regular,
  },
  buttonTextRightActive: {
    color: Colors.background,
  },
  closeButton: {
    borderRadius: 100, // Circular
    paddingVertical: 0,
    paddingHorizontal: 0,
    width: 35,
    alignSelf: "flex-end",
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});
