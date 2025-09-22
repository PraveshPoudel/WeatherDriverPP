import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { StatusBar } from "expo-status-bar";

const PASS_STORAGE_KEY = 'toll_passes';

const PASS_LIST = [
  'BancPass', 'Bestpass', 'E-PASS', 'E-ZPass', 'Express Lanes', 'ExpressToll', 'EZ Tag',
  'EZPass', 'FasTrak', 'Fuego', 'Good To Go! Pass', 'K-Tag', 'Peach Pass', 'Pike Pass',
  'Sun Pass', 'TEXpress', 'TollTag', 'TxTag'
];

export default function TollPassScreen() {
  const router = useRouter();

  const [passes, setPasses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadPasses = async () => {
      try {
        const stored = await AsyncStorage.getItem(PASS_STORAGE_KEY);
        if (stored) {
          setPasses(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load toll passes', error);
      }
    };
    loadPasses();
  }, []);

  const togglePass = async (name: string) => {
    const updated = { ...passes, [name]: !passes[name] };
    setPasses(updated);
    try {
      await AsyncStorage.setItem(PASS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save toll passes', error);
    }
  };

  const renderItem = ({ item }: { item: string }) => {
    const selected = passes[item] || false;
    return (
      <TouchableOpacity style={styles.row} onPress={() => togglePass(item)}>
        <Text style={styles.passName}>{item}</Text>
        <Ionicons
          name={selected ? 'checkmark-circle-outline' : 'add-circle-outline'}
          size={24}
          color={selected ? Colors.success : Colors.primary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.bold} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Toll and Express Lane Passes</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
          <Ionicons name="close" size={24} color={Colors.bold} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={PASS_LIST}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.bold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  passName: {
    fontSize: 16,
    color: Colors.bold,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.soft,
  },
});
