import React, { useMemo, useState } from "react";
import { View, StyleSheet, Pressable, Text, FlatList } from "react-native";
import AppBar from "../../components/ui/AppBar";
import AlertCard from "../../components/AlertCard";
import { colors, spacing, radius } from "../../theme/tokens";

const SEVERITIES = ["Extreme","Severe","Moderate","Minor"];

const SAMPLE_ALERTS = [
  { id: "1", title: "Severe Thunderstorm", description: "Damaging winds possible.", severity: "Severe", area: "King County, WA", updatedAt: new Date().toISOString() },
  { id: "2", title: "Winter Weather Advisory", description: "Snow & icy roads.", severity: "Moderate", area: "Snohomish County, WA", updatedAt: new Date().toISOString() },
  { id: "3", title: "Excessive Heat Warning", description: "Highs up to 40°C.", severity: "Extreme", area: "Clark County, NV", updatedAt: new Date().toISOString() }
];

export default function AlertsScreen() {
  const [severity, setSeverity] = useState("");
  const data = useMemo(
    () => (severity ? SAMPLE_ALERTS.filter(a => a.severity === severity) : SAMPLE_ALERTS),
    [severity]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar title="Alerts" />
      <View style={styles.filterRow}>
        {SEVERITIES.map(s => (
          <Pressable key={s} onPress={() => setSeverity(severity === s ? "" : s)}
            style={[styles.chip, severity === s && styles.chipActive]}>
            <Text style={styles.chipText}>{s}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => setSeverity("")} style={styles.clearBtn}>
          <Text style={{ color: "#fff" }}>Clear</Text>
        </Pressable>
      </View>
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <AlertCard {...item} />}
        contentContainerStyle={{ paddingVertical: spacing.sm }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: "#212636", borderWidth: 1, borderColor: "#2A2F3A" },
  chipActive: { backgroundColor: "#3B3F52" },
  chipText: { color: "#fff" },
  clearBtn: { marginLeft: "auto", paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.md, backgroundColor: colors.primary }
});
