import React, { JSX, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { Colors } from '@/constants/Colors';
import { STORAGE_KEYS } from '@/constants/storage';
import { SavedRoute } from '@/types/routes';
import { AlertSummary } from '@/types/weather';
import { getSeverityBaseColor, getSeverityColor, getSeverityLabel } from '@/scripts/alerts';

const SavedDrivesScreen = (): JSX.Element => {
  const router = useRouter();
  const [savedRoute, setSavedRoute] = useState<SavedRoute | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadSavedRoute = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedRoute = await AsyncStorage.getItem(STORAGE_KEYS.savedRoute);

      if (storedRoute) {
        const parsedRoute: SavedRoute = JSON.parse(storedRoute);

        if (parsedRoute && Array.isArray(parsedRoute.coordinates)) {
          setSavedRoute(parsedRoute);
        } else {
          setSavedRoute(null);
        }
      } else {
        setSavedRoute(null);
      }
    } catch (error) {
      console.error('Error loading saved route', error);
      setSavedRoute(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedRoute();
    }, [loadSavedRoute])
  );

  const handleNavigateToMap = () => {
    router.push('/(tabs)/map');
  };

  const confirmRemoval = () => {
    Alert.alert(
      'Remove saved drive',
      'Removing this drive will delete your saved waypoints and alert information.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEYS.savedRoute);
            await AsyncStorage.removeItem(STORAGE_KEYS.legacyRoute);
            setSavedRoute(null);
          },
        },
      ]
    );
  };

  const renderAlertSummary = (summary: AlertSummary) => {
    const severityLabel = getSeverityLabel(summary.severity);
    const severityColor = getSeverityBaseColor(severityLabel);

    return (
      <View key={summary.id} style={styles.alertCard}>
        <View
          style={[
            styles.alertSeverityPill,
            {
              backgroundColor: getSeverityColor(severityLabel, 0.15),
              borderColor: severityColor,
            },
          ]}
        >
          <Text style={[styles.alertSeverityText, { color: severityColor }]}>{severityLabel}</Text>
        </View>
        <Text style={styles.alertTitle} numberOfLines={2}>
          {summary.title}
        </Text>
        {summary.event?.length ? (
          <Text style={styles.alertEvent} numberOfLines={1}>
            {summary.event}
          </Text>
        ) : null}
        {summary.expires?.length ? (
          <Text style={styles.alertExpires}>Expires {moment(summary.expires).fromNow()}</Text>
        ) : null}
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading saved drives...</Text>
        </View>
      );
    }

    if (!savedRoute) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={48} color={Colors.soft} />
          <Text style={styles.emptyTitle}>No drives saved yet</Text>
          <Text style={styles.emptySubtitle}>
            Plan your route and tap the bookmark icon on the map to save it here for quick access.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleNavigateToMap}>
            <Text style={styles.primaryButtonText}>Plan a drive</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Saved on</Text>
          <Text style={styles.summaryValue}>
            {moment(savedRoute.savedAt).format('MMM D, YYYY h:mm A')} ({moment(savedRoute.savedAt).fromNow()})
          </Text>

          <View style={styles.routeRow}>
            <Ionicons name="flag-outline" size={18} color={Colors.regular} />
            <Text style={styles.routeText}>{savedRoute.originLabel}</Text>
          </View>
          <View style={styles.routeConnector}>
            <View style={styles.routeLine} />
            <Ionicons name="navigate-outline" size={16} color={Colors.secondary} />
            <View style={styles.routeLine} />
          </View>
          <View style={styles.routeRow}>
            <Ionicons name="flag" size={18} color={Colors.regular} />
            <Text style={styles.routeText}>{savedRoute.destinationLabel}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={Colors.regular} />
              <Text style={styles.metaLabel}>Drive time</Text>
              <Text style={styles.metaValue}>{savedRoute.durationText || '—'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="speedometer-outline" size={16} color={Colors.regular} />
              <Text style={styles.metaLabel}>Distance</Text>
              <Text style={styles.metaValue}>{savedRoute.distanceText || '—'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={Colors.regular} />
              <Text style={styles.metaLabel}>Arrival</Text>
              <Text style={styles.metaValue}>{savedRoute.arrivalTime || '—'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weather alerts on this route</Text>
            {savedRoute.alertSummaries.length > 0 ? (
              <Text style={styles.sectionBadge}>{savedRoute.alertSummaries.length}</Text>
            ) : null}
          </View>
          {savedRoute.alertSummaries.length > 0 ? (
            savedRoute.alertSummaries.map(renderAlertSummary)
          ) : (
            <Text style={styles.sectionSubtitle}>No weather alerts saved with this drive.</Text>
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={confirmRemoval}>
            <Ionicons name="trash-outline" size={18} color={Colors.error} style={styles.secondaryIcon} />
            <Text style={[styles.secondaryButtonText, { color: Colors.error }]}>Remove</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={handleNavigateToMap}>
            <Ionicons name="navigate" size={18} color={Colors.background} style={styles.primaryButtonIcon} />
            <Text style={styles.primaryButtonText}>Open in map</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.bold} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved drives</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleNavigateToMap}>
          <Ionicons name="map-outline" size={22} color={Colors.bold} />
        </TouchableOpacity>
      </View>
      {renderContent()}
    </View>
  );
};

export default SavedDrivesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.input,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00000010',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.bold,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: Colors.input,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0000000d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.soft,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.bold,
    marginBottom: 16,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeText: {
    marginLeft: 8,
    fontSize: 15,
    color: Colors.regular,
    flexShrink: 1,
  },
  routeConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  routeLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.secondary,
    marginHorizontal: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.soft,
    textTransform: 'uppercase',
  },
  metaValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.bold,
  },
  section: {
    backgroundColor: Colors.input,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0000000d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.bold,
  },
  sectionBadge: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    color: Colors.regular,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.regular,
  },
  alertCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  alertSeverityPill: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  alertSeverityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.bold,
  },
  alertEvent: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.regular,
  },
  alertExpires: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.soft,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.input,
    flex: 1,
    marginRight: 12,
    shadowColor: '#0000000d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  secondaryIcon: {
    marginRight: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    shadowColor: '#00000014',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  primaryButtonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.background,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.bold,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.regular,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.regular,
  },
});
