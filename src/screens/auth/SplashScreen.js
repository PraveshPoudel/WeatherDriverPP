import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { colors } from "../../theme/tokens";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace("Onboarding"), 1200);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.root}>
      <Image source={require("../../../assets/splash-icon.png")} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  logo: { width: 180, height: 180, resizeMode: "contain" }
});
