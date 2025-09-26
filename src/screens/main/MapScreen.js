import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import MapView, { Marker, Polygon } from "react-native-maps";
import * as Location from "expo-location";
import AppBar from "../../components/ui/AppBar";
import { colors } from "../../theme/tokens";

const SAMPLE = {
  zones: [{ id: "z1", polygon: [{ lat: 47.6, lon: -122.4 }, { lat: 47.7, lon: -122.4 }, { lat: 47.7, lon: -122.3 }] }],
  alerts: [{ id: "a1", title: "Severe Thunderstorm", center: { lat: 47.62, lon: -122.33 } }]
};

export default function MapScreen() {
  const [region, setRegion] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.25,
        longitudeDelta: 0.25
      });
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar title="Map" />
      {region ? (
        <MapView 
          style={StyleSheet.absoluteFill} 
          initialRegion={region} 
          customMapStyle={darkMapStyle}
          showsUserLocation={true}
          followsUserLocation={true}>
          {SAMPLE.zones.map(z => (
            <Polygon key={z.id}
              coordinates={z.polygon.map(p => ({ latitude: p.lat, longitude: p.lon }))}
              strokeColor="#4ADE80" fillColor="rgba(74,222,128,0.12)" />
          ))}
          {SAMPLE.alerts.map(a => (
            <Marker key={a.id} coordinate={{ latitude: a.center.lat, longitude: a.center.lon }} title={a.title} />
          ))}
        </MapView>
      ) : (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={{ color: "#9CA3AF", marginTop: 8 }}>Fetching your location…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ center: { flex: 1, alignItems: "center", justifyContent: "center" } });

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] }
];
