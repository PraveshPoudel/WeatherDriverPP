import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, type, spacing, radius } from "../theme/tokens";
import AlertBadge from "./AlertBadge";

export default function AlertCard({ title, description, severity, area, updatedAt }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <AlertBadge severity={severity} />
      </View>
      {!!description && <Text style={styles.desc} numberOfLines={3}>{description}</Text>}
      <Text style={styles.meta}>{area} • Updated {new Date(updatedAt).toLocaleTimeString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceAlt,
    marginHorizontal: spacing.lg, marginVertical: spacing.sm,
    padding: spacing.md, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { ...type.h3, color: colors.text, flex: 1, marginRight: spacing.sm },
  desc: { ...type.body, color: "#C9CED8", marginTop: 6 },
  meta: { ...type.caption, color: colors.muted, marginTop: 8 }
});
