import React, { useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import AppBar from "../../components/ui/AppBar";
import { colors, spacing, type } from "../../theme/tokens";

export default function SettingsScreen() {
  const [push, setPush] = useState(true);
  const [severeOnly, setSevereOnly] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar title="Settings" />
      <View style={styles.item}>
        <Text style={styles.lbl}>Push Notifications</Text>
        <Switch value={push} onValueChange={setPush} />
      </View>
      <View style={styles.item}>
        <Text style={styles.lbl}>Only Severe/Extreme Alerts</Text>
        <Switch value={severeOnly} onValueChange={setSevereOnly} />
      </View>
      <Text style={styles.helper}>Your preferences can be saved to backend later.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  lbl: { ...type.body, color: colors.text },
  helper: { ...type.caption, color: colors.muted, marginTop: spacing.lg, marginHorizontal: spacing.lg }
});
