import React, { useRef, useState } from "react";
import { View, Text, FlatList, Dimensions, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import WDButton from "../../components/ui/WDButton";
import { colors, type, spacing } from "../../theme/tokens";

const { width } = Dimensions.get("window");
const slides = [
  { key: "s1", title: "Know Before You Go", desc: "Get real-time hazardous weather alerts along your route.", img: require("../../../assets/onb1.png") },
  { key: "s2", title: "Navigate Safely", desc: "Smart overlays on the map keep you informed.", img: require("../../../assets/onb2.png") },
  { key: "s3", title: "Customize Alerts", desc: "Choose the alerts that matter most to you.", img: require("../../../assets/onb3.png") }
];

export default function OnboardingScreen({ navigation }) {
  const ref = useRef(null);
  const [idx, setIdx] = useState(0);

  return (
    <LinearGradient colors={[colors.bg, "#0F1220"]} style={{ flex: 1 }}>
      <FlatList
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={slides}
        onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
        keyExtractor={(i) => i.key}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.img} style={styles.img} />
            <Text style={styles.h1}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />
      <View style={styles.dots}>
        {slides.map((_, i) => <View key={i} style={[styles.dot, i === idx && styles.dotActive]} />)}
      </View>
      <View style={styles.ctaRow}>
        <WDButton label="Create Account" onPress={() => navigation.navigate("SignUp")} />
        <WDButton label="Sign In" onPress={() => navigation.navigate("SignIn")} style={{ backgroundColor: colors.surface }} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  slide: { width, alignItems: "center", paddingTop: spacing.xxl },
  img: { width: width * 0.8, height: width * 0.8, resizeMode: "contain", marginBottom: spacing.lg },
  h1: { ...type.h1, color: "#fff", textAlign: "center" },
  desc: { ...type.body, color: "#CDD2DC", marginTop: spacing.sm, textAlign: "center", paddingHorizontal: spacing.xl },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginVertical: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2A2F3A" },
  dotActive: { backgroundColor: colors.primary },
  ctaRow: { padding: spacing.lg, gap: spacing.md }
});
