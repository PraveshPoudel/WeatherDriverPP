import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { severityColors, type, spacing, radius } from "../theme/tokens";

export default function AlertBadge({ severity }) {
  const bg = severityColors[severity] || "#4B5563";
  return (
    <View style={[styles.wrap, { backgroundColor: bg }]}>
      <Text style={styles.txt}>{severity}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  txt: { ...type.caption, color: "#fff" }
});
