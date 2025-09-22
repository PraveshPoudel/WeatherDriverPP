import React, { useState, useEffect, JSX } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';

const pushOptions = [
  'Important alerts',
  'Announcements and Updates',
  'Holiday traffic',
  'Traffic delay notifications',
  'Major traffic events',
  'Planned Drives Reminders',
];

const emailOptions = [
  'Traffic in my area',
  'Personalized tips',
  'News and Updates',
  'Important Announcements',
  'Promotional offers',
  'Service Updates',
];

export default function NotificationsSettingsScreen(): JSX.Element {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'push' | 'email'>('push');

  const [pushPrefs, setPushPrefs] = useState<Record<string, boolean>>({});
  const [emailPrefs, setEmailPrefs] = useState<Record<string, boolean>>({});

  const [pushAll, setPushAll] = useState(true);
  const [emailAll, setEmailAll] = useState(false);

  const PUSH_KEY = 'push_notifications';
  const EMAIL_KEY = 'email_notifications';

  useEffect(() => {
    const loadSettings = async () => {
      const push = await AsyncStorage.getItem(PUSH_KEY);
      const email = await AsyncStorage.getItem(EMAIL_KEY);
      if (push) {
        const parsed = JSON.parse(push);
        setPushPrefs(parsed);
        setPushAll(Object.values(parsed).every(Boolean));
      } else {
        const defaultPrefs = Object.fromEntries(pushOptions.map(opt => [opt, true]));
        setPushPrefs(defaultPrefs);
        setPushAll(true);
      }
      if (email) {
        const parsed = JSON.parse(email);
        setEmailPrefs(parsed);
        setEmailAll(Object.values(parsed).every(Boolean));
      } else {
        const defaultPrefs = Object.fromEntries(emailOptions.map(opt => [opt, false]));
        setEmailPrefs(defaultPrefs);
        setEmailAll(false);
      }
    };
    loadSettings();
  }, []);

  const handleToggle = (type: 'push' | 'email', key: string) => {
    if (type === 'push') {
      const updated = { ...pushPrefs, [key]: !pushPrefs[key] };
      setPushPrefs(updated);
      setPushAll(Object.values(updated).every(Boolean));
    } else {
      const updated = { ...emailPrefs, [key]: !emailPrefs[key] };
      setEmailPrefs(updated);
      setEmailAll(Object.values(updated).every(Boolean));
    }
  };

  const handleToggleAll = (type: 'push' | 'email') => {
    if (type === 'push') {
      const updated = Object.fromEntries(pushOptions.map(opt => [opt, !pushAll]));
      setPushPrefs(updated);
      setPushAll(!pushAll);
    } else {
      const updated = Object.fromEntries(emailOptions.map(opt => [opt, !emailAll]));
      setEmailPrefs(updated);
      setEmailAll(!emailAll);
    }
  };

  const savePrefs = async () => {
    await AsyncStorage.setItem(PUSH_KEY, JSON.stringify(pushPrefs));
    await AsyncStorage.setItem(EMAIL_KEY, JSON.stringify(emailPrefs));
    router.back();
  };

  const renderOptions = () => {
    const options = activeTab === 'push' ? pushOptions : emailOptions;
    const prefs = activeTab === 'push' ? pushPrefs : emailPrefs;

    return (
      <>
        {options.map(opt => (
          <View key={opt} style={styles.optionRow}>
            <Text style={styles.optionText}>{opt}</Text>
            <Switch
              value={prefs[opt]}
              onValueChange={() => handleToggle(activeTab, opt)}
              trackColor={{ false: '#ccc', true: Colors.primary }}
              thumbColor={prefs[opt] ? Colors.primary : '#f4f3f4'}
            />
          </View>
        ))}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'push' && styles.activeTab]}
          onPress={() => setActiveTab('push')}
        >
          <Text style={[styles.tabText, activeTab === 'push' && styles.activeTabText]}>Push</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'email' && styles.activeTab]}
          onPress={() => setActiveTab('email')}
        >
          <Text style={[styles.tabText, activeTab === 'email' && styles.activeTabText]}>Email</Text>
        </TouchableOpacity>
      </View>

      {/* Notification Toggles */}
      <ScrollView style={styles.content}>
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>
            {activeTab === 'push' ? 'Receive all push notifications' : 'Receive all email notifications'}
          </Text>
          <Switch
            value={activeTab === 'push' ? pushAll : emailAll}
            onValueChange={() => handleToggleAll(activeTab)}
            trackColor={{ false: '#ccc', true: Colors.primary }}
            thumbColor={(activeTab === 'push' ? pushAll : emailAll) ? Colors.primary : '#f4f3f4'}
          />
        </View>
        {renderOptions()}
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={savePrefs}>
        <Text style={styles.saveButtonText}>SAVE</Text>
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.bold,
  },
  tabs: {
    flexDirection: 'row',
    marginTop: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: Colors.regular,
  },
  activeTabText: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  content: {
    marginTop: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
    color: Colors.bold,
    flex: 1,
    paddingRight: 10,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
