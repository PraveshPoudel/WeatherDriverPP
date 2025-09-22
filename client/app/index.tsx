import React from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import AppButton from "@/components/AppButton";

const { width } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image
        source={require("../assets/images/weather-driver-logo-alt.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.buttonContainer}>
        <AppButton
          title="Sign In"
          buttonStyle={styles.button}
          onPress={() => router.navigate("/(tabs)/log-in")}
        />
        <AppButton
          title="Create Account"
          buttonStyle={[styles.button, styles.buttonBottom]}
          textStyle={styles.buttonTextBottom}
          onPress={() => router.navigate("/(tabs)/sign-up")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 20,
  },
  logo: {
    width: width * 0.6,
    height: undefined, // Calculated from aspect ratio
    aspectRatio: 1,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonBottom: {
    backgroundColor: Colors.secondary,
  },
  buttonTextBottom: {
    color: Colors.regular,
  },
});
