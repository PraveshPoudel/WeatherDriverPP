import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { colors, type, radius } from "../../theme/tokens";

export default function WDButton({ label, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={[styles.btn, style]}>
      <Text style={styles.txt}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 48, borderRadius: radius.md,
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.primary
  },
  txt: { ...type.h3, color: "#fff" }
});
