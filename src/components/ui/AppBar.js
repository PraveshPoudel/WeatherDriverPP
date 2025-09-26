import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, type, spacing, radius } from "../../theme/tokens";

export default function AppBar({ title }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md
  },
  title: { ...type.h2, color: colors.text }
});
