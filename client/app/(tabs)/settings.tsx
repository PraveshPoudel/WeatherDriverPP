import React, { JSX } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';

export default function SettingsScreen(): JSX.Element {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* General & Notifications */}
      {/* <TouchableOpacity style={styles.card} onPress={() => router.navigate('/(tabs)/general-settings')}>
        <Text style={styles.cardText}>General</Text>
      </TouchableOpacity> */}

      <TouchableOpacity style={styles.card} onPress={() => router.navigate('/(tabs)/notification-settings')}>
        <Text style={styles.cardText}>Notifications</Text>
      </TouchableOpacity>

      {/* Driving Preferences */}
      <Text style={styles.sectionTitle}>Driving Preferences</Text>
      <View style={styles.preferenceCard}>
        <SettingsItem
          title="Tolls and Express Lane Passes"
          icon={<MaterialCommunityIcons name="highway" size={20} color={Colors.bold} />}
          onPress={() => router.push('/(tabs)/tolls')}
        />
        {/* <SettingsItem
          title="Gas Stations"
          icon={<FontAwesome5 name="gas-pump" size={18} color={Colors.bold} />}
          onPress={() => router.push('/(tabs)/gas-stations')}
        /> */}
        <SettingsItem
          title="Speedometer"
          icon={<Ionicons name="speedometer-outline" size={20} color={Colors.bold} />}
          onPress={() => router.push('/(tabs)/speedometersettings')}
        />
      </View>
    </View>
  );
}

const SettingsItem = ({ title, icon, onPress }: { title: string; icon: JSX.Element; onPress: () => void }) => (
  <TouchableOpacity style={styles.preferenceItem} onPress={onPress}>
    {icon}
    <Text style={styles.preferenceText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.bold,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
    color: Colors.bold,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 10,
    color: Colors.regular,
  },
  preferenceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  preferenceText: {
    marginLeft: 12,
    fontSize: 15,
    color: Colors.bold,
  },
});
