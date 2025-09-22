import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/Colors';
import { StatusBar } from "expo-status-bar";

// Adjust this according to your stack navigator
type RootStackParamList = {
  Settings: undefined;
  SpeedometerSettings: undefined;
};

const SpeedometerSettingsScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'SpeedometerSettings'>>();

  const [unit, setUnit] = useState<'mph' | 'kmh'>('mph');
  const [showSpeedLimit, setShowSpeedLimit] = useState<'dont_show' | 'when_above_limit' | 'always'>('when_above_limit');
  const [speedingThreshold, setSpeedingThreshold] = useState<
    'at_limit' | '5_above_limit' | '10_above_limit' | '15_above_limit' | '20_above_limit'
  >('5_above_limit');
  const [showOnMap, setShowOnMap] = useState<boolean>(true);
  const [alertWhenSpeeding, setAlertWhenSpeeding] = useState<boolean>(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedUnit = await AsyncStorage.getItem('speed_unit');
        const savedShowSpeedLimit = await AsyncStorage.getItem('show_speed_limit');
        const savedThreshold = await AsyncStorage.getItem('speeding_threshold');
        const savedShowOnMap = await AsyncStorage.getItem('show_on_map');
        const savedAlert = await AsyncStorage.getItem('alert_when_speeding');

        if (savedUnit === 'mph' || savedUnit === 'kmh') setUnit(savedUnit);
        if (
          savedShowSpeedLimit === 'dont_show' ||
          savedShowSpeedLimit === 'when_above_limit' ||
          savedShowSpeedLimit === 'always'
        )
          setShowSpeedLimit(savedShowSpeedLimit);
        if (
          ['at_limit', '5_above_limit', '10_above_limit', '15_above_limit', '20_above_limit'].includes(
            savedThreshold || ''
          )
        )
          setSpeedingThreshold(savedThreshold as typeof speedingThreshold);
        if (savedShowOnMap !== null) setShowOnMap(savedShowOnMap === 'true');
        if (savedAlert !== null) setAlertWhenSpeeding(savedAlert === 'true');
      } catch (error) {
        console.error('Error loading settings', error);
      }
    };

    loadSettings();
  }, []);

  const saveSetting = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving setting', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.bold} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Speedometer</Text>
      </View>

      {/* Speed Unit */}
      <Text style={styles.label}>Speed Unit</Text>
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segment, unit === 'mph' && styles.selectedSegment]}
          onPress={() => {
            setUnit('mph');
            saveSetting('speed_unit', 'mph');
          }}
        >
          <Text style={unit === 'mph' ? styles.selectedText : styles.unselectedText}>Miles/hr</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, unit === 'kmh' && styles.selectedSegment]}
          onPress={() => {
            setUnit('kmh');
            saveSetting('speed_unit', 'kmh');
          }}
        >
          <Text style={unit === 'kmh' ? styles.selectedText : styles.unselectedText}>Kilometers/hr</Text>
        </TouchableOpacity>
      </View>

      {/* Show Speed Limit */}
      <Text style={styles.label}>Show Speed Limit</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={showSpeedLimit}
          onValueChange={(value) => {
            setShowSpeedLimit(value);
            saveSetting('show_speed_limit', value);
          }}
        >
          <Picker.Item label="Don't Show" value="dont_show" />
          <Picker.Item label="When above limit" value="when_above_limit" />
          <Picker.Item label="Always" value="always" />
        </Picker>
      </View>

      {/* Speeding Threshold */}
      <Text style={styles.label}>Speeding Threshold</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={speedingThreshold}
          onValueChange={(value) => {
            setSpeedingThreshold(value);
            saveSetting('speeding_threshold', value);
          }}
        >
          <Picker.Item label="At speed limit" value="at_limit" />
          <Picker.Item label="5 above limit" value="5_above_limit" />
          <Picker.Item label="10 above limit" value="10_above_limit" />
          <Picker.Item label="15 above limit" value="15_above_limit" />
          <Picker.Item label="20 above limit" value="20_above_limit" />
        </Picker>
      </View>

      {/* Show on Map */}
      <View style={styles.switchRow}>
        <Text style={styles.label}>Show on Map</Text>
        <Switch
          value={showOnMap}
          onValueChange={(value) => {
            setShowOnMap(value);
            saveSetting('show_on_map', value.toString());
          }}
        />
      </View>

      {/* Alert When Speeding */}
      <View style={styles.switchRow}>
        <Text style={styles.label}>Alert When Speeding</Text>
        <Switch
          value={alertWhenSpeeding}
          onValueChange={(value) => {
            setAlertWhenSpeeding(value);
            saveSetting('alert_when_speeding', value.toString());
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    color: Colors.bold,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    color: Colors.bold,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: Colors.soft,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.input,
  },
  selectedSegment: {
    backgroundColor: Colors.primary,
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  unselectedText: {
    color: Colors.bold,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors.soft,
    borderRadius: 8,
    overflow: 'hidden',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
});

export default SpeedometerSettingsScreen;
