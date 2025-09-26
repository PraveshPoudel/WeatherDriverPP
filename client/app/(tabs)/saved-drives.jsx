import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { Colors } from '@/constants/Colors';

const SAVED_ROUTE_KEY = 'savedRoute';

const loadSavedRoute = async () => {
  try {
    const raw = await AsyncStorage.getItem(SAVED_ROUTE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.coordinates)) {
        return parsed;
      }
    }

    const fallback = await AsyncStorage.getItem('route');
    if (fallback) {
      const coordinates = JSON.parse(fallback);
      if (Array.isArray(coordinates)) {
        return {
          id: 'legacy-route',
          savedAt: new Date().toISOString(),
          originLabel: 'Saved origin',
          destinationLabel: 'Saved destination',
          distanceText: '-',
          durationText: '-',
          coordinates,
        };
      }
    }
  } catch (error) {
    console.error('Error loading saved routes', error);
  }

  return null;
};

export default function SavedDrivesScreen() {
  const router = useRouter();
  const [savedRoute, setSavedRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshRoutes = useCallback(async () => {
    setIsLoading(true);
    const data = await loadSavedRoute();
    setSavedRoute(data);
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshRoutes();
    }, [refreshRoutes])
  );

  const data = useMemo(() => {
    if (!savedRoute) {
      return [];
    }
    return [savedRoute];
  }, [savedRoute]);

  const handleRemove = async () => {
    try {
      await AsyncStorage.removeItem(SAVED_ROUTE_KEY);
      await AsyncStorage.removeItem('route');
      setSavedRoute(null);
    } catch (error) {
      console.error('Unable to remove saved route', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.pageTitle}>Saved drives</Text>
      <Text style={styles.pageSubtitle}>
        Quickly revisit the routes you've planned and monitor new advisories along the way.
      </Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const savedMoment = item.savedAt ? moment(item.savedAt) : null;
    const savedDisplay = savedMoment?.isValid() ? savedMoment.format('MMM D, YYYY • h:mm A') : 'Unknown';

    return (
      <View style={styles.routeCard}>
        <View style={styles.routeHeader}>
          <Ionicons name="car-outline" size={20} color={Colors.primary} />
          <Text style={styles.routeSavedAt}>Saved {savedDisplay}</Text>
        </View>
        <View style={styles.routePath}>
          <View style={styles.routeBulletColumn}>
            <View style={[styles.routeBullet, styles.routeBulletStart]} />
            <View style={styles.routeConnector} />
            <View style={[styles.routeBullet, styles.routeBulletEnd]} />
          </View>
          <View style={styles.routeInfoColumn}>
            <Text style={styles.routeLabel}>Origin</Text>
            <Text style={styles.routeValue}>{item.originLabel || 'Current location'}</Text>
            <View style={styles.routeSpacing} />
            <Text style={styles.routeLabel}>Destination</Text>
            <Text style={styles.routeValue}>{item.destinationLabel || 'Chosen address'}</Text>
          </View>
        </View>
        <View style={styles.routeStats}>
          <View style={styles.statPill}>
            <Ionicons name="time-outline" size={16} color={Colors.primary} />
            <Text style={styles.statLabel}>{item.durationText || '—'}</Text>
          </View>
          <View style={styles.statPill}>
            <Ionicons name="speedometer-outline" size={16} color={Colors.primary} />
            <Text style={styles.statLabel}>{item.distanceText || '—'}</Text>
          </View>
          <View style={styles.statPill}>
            <Ionicons name="walk-outline" size={16} color={Colors.primary} />
            <Text style={styles.statLabel}>
              {item.coordinates ? `${item.coordinates.length} pts` : '0 pts'}
            </Text>
          </View>
        </View>
        <View style={styles.routeActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => router.push('/(tabs)/map')}
          >
            <Ionicons name="navigate" size={16} color="#fff" />
            <Text style={styles.actionButtonLabelPrimary}>Open in map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleRemove}>
            <Ionicons name="trash-outline" size={16} color={Colors.error} />
            <Text style={styles.actionButtonLabel}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id || 'saved-route'}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyState}>
              <Ionicons name="bookmark-outline" size={40} color={Colors.soft} />
              <Text style={styles.emptyTitle}>No saved drives yet</Text>
              <Text style={styles.emptyMessage}>
                Plan a route on the map and press the save button to keep it handy for later.
              </Text>
            </View>
          )
        }
        refreshing={isLoading}
        onRefresh={refreshRoutes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 20,
    gap: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.bold,
  },
  pageSubtitle: {
    fontSize: 15,
    color: Colors.regular,
    lineHeight: 22,
  },
  routeCard: {
    backgroundColor: Colors.input,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#00000010',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 16,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeSavedAt: {
    fontSize: 13,
    color: Colors.soft,
  },
  routePath: {
    flexDirection: 'row',
    gap: 16,
  },
  routeBulletColumn: {
    alignItems: 'center',
  },
  routeBullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  routeBulletStart: {
    backgroundColor: Colors.primary,
  },
  routeBulletEnd: {
    backgroundColor: Colors.secondary,
  },
  routeConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#cbe8ef',
    marginVertical: 4,
  },
  routeInfoColumn: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: Colors.soft,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  routeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.bold,
  },
  routeSpacing: {
    height: 14,
  },
  routeStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.regular,
  },
  routeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#00000010',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    shadowOpacity: 0.12,
  },
  actionButtonLabel: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '600',
  },
  actionButtonLabelPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    marginTop: 80,
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.bold,
  },
  emptyMessage: {
    fontSize: 15,
    color: Colors.regular,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
