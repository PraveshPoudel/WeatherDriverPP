import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, FlatList, Pressable } from "react-native";
import AppBar from "../../components/ui/AppBar";
import { colors, spacing, radius, type } from "../../theme/tokens";

export default function SearchScreen() {
  const [q, setQ] = useState("");
  const results = q ? [{ name: "Seattle, WA", lat: 47.6062, lon: -122.3321 }] : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar title="Search" />
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Search city, place, or zone"
          placeholderTextColor={colors.muted}
          value={q} onChangeText={setQ}
          returnKeyType="search"
        />
        <Pressable style={styles.btn} onPress={() => {}}>
          <Text style={{ color: "#fff" }}>Go</Text>
        </Pressable>
      </View>
      <FlatList
        data={results}
        keyExtractor={(i, idx) => i.name + idx}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.sub}>{item.lat.toFixed(3)}, {item.lon.toFixed(3)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{q ? "No results" : "Start typing to search…"}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm, padding: spacing.md },
  input: {
    flex: 1, backgroundColor: colors.surface, color: colors.text,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, height: 44
  },
  btn: { backgroundColor: colors.primary, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg },
  card: { backgroundColor: colors.surfaceAlt, marginHorizontal: spacing.md, marginBottom: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  name: { ...type.body, color: colors.text },
  sub: { ...type.caption, color: colors.muted, marginTop: 2 },
  empty: { ...type.caption, color: colors.muted, textAlign: "center", marginTop: spacing.lg }
});
