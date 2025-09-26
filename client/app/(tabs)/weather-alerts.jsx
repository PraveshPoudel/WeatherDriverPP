import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { Colors } from '@/constants/Colors';
import { getSeverityColor, getSeverityLabel } from '@/utils/alerts';

const weatherAlertData = require('../../assets/data/all_weather_alerts.json');

const severityFilters = ['All', 'Minor', 'Moderate', 'Severe'];

const timeframeFilters = [
  { label: 'Active', value: 'active' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Expired', value: 'expired' },
  { label: 'All', value: 'all' },
];

const getAlertList = () => {
  if (weatherAlertData && Array.isArray(weatherAlertData.alerts)) {
    return weatherAlertData.alerts;
  }
  return [];
};

const classifyTimeframe = (alert) => {
  const now = moment();
  const start = moment(alert.start);
  const end = moment(alert.end);

  if (start.isValid() && now.isBefore(start)) {
    return 'upcoming';
  }

  if (end.isValid() && now.isAfter(end)) {
    return 'expired';
  }

  return 'active';
};

const formatTimeRange = (alert) => {
  const start = moment(alert.start);
  const end = moment(alert.end);

  if (start.isValid() && end.isValid()) {
    return `${start.format('MMM D, h:mm A')} - ${end.format('MMM D, h:mm A')}`;
  }

  if (start.isValid()) {
    return `Starts ${start.fromNow()}`;
  }

  if (end.isValid()) {
    return `Ended ${end.fromNow()}`;
  }

  return 'Timing unavailable';
};

export default function WeatherAlertsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState('active');

  const allAlerts = useMemo(() => getAlertList(), []);

  const decoratedAlerts = useMemo(
    () =>
      allAlerts.map((alert) => ({
        ...alert,
        timeframe: classifyTimeframe(alert),
      })),
    [allAlerts]
  );

  const timeframeSummary = useMemo(() => {
    return decoratedAlerts.reduce(
      (acc, alert) => {
        acc.total += 1;
        acc[alert.timeframe] += 1;
        return acc;
      },
      { total: 0, active: 0, upcoming: 0, expired: 0 }
    );
  }, [decoratedAlerts]);

  const filteredAlerts = useMemo(() => {
    return decoratedAlerts.filter((alert) => {
      if (
        selectedSeverity !== 'All' &&
        getSeverityLabel(alert.severity) !== selectedSeverity
      ) {
        return false;
      }

      if (selectedTimeframe !== 'all' && alert.timeframe !== selectedTimeframe) {
        return false;
      }

      if (!searchQuery) {
        return true;
      }

      const normalized = searchQuery.toLowerCase();
      return (
        alert.title?.toLowerCase().includes(normalized) ||
        alert.event?.toLowerCase().includes(normalized)
      );
    });
  }, [decoratedAlerts, searchQuery, selectedSeverity, selectedTimeframe]);

  const renderMetricCard = (label, value) => (
    <View key={label} style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );

  const renderFilterChip = (label, isActive, onPress) => (
    <TouchableOpacity
      key={label}
      onPress={onPress}
      style={[styles.chip, isActive && styles.chipActive]}
    >
      <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderAlert = ({ item }) => {
    const severityLabel = getSeverityLabel(item.severity);
    const severityColor = getSeverityColor(severityLabel, 0.2);

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/(tabs)/alert-details',
            params: { id: item.id },
          })
        }
        style={styles.alertCard}
      >
        <View style={styles.alertHeader}>
          <View style={[styles.severityTag, { backgroundColor: severityColor }]}> 
            <Ionicons
              name="warning-outline"
              size={16}
              color={getSeverityColor(severityLabel)}
            />
            <Text
              style={[styles.severityLabel, { color: getSeverityColor(severityLabel) }]}
            >
              {severityLabel}
            </Text>
          </View>
          <Text style={styles.timeframe}>{item.timeframe.toUpperCase()}</Text>
        </View>
        <Text style={styles.alertTitle}>{item.title || 'Unnamed alert'}</Text>
        {item.event ? (
          <Text style={styles.alertEvent}>{item.event}</Text>
        ) : null}
        <Text style={styles.alertTime}>{formatTimeRange(item)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id}
        renderItem={renderAlert}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cloud-offline-outline" size={36} color={Colors.soft} />
            <Text style={styles.emptyTitle}>No alerts match your filters</Text>
            <Text style={styles.emptyCaption}>
              Adjust the severity or timeframe filters to see more advisories in your area.
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.pageTitle}>Weather alerts</Text>
                <Text style={styles.pageSubtitle}>
                  Stay aware of significant advisories affecting your saved drives.
                </Text>
              </View>
              <Ionicons name="rainy-outline" size={28} color={Colors.primary} />
            </View>

            <View style={styles.metricsRow}>
              {renderMetricCard('Active', timeframeSummary.active)}
              {renderMetricCard('Upcoming', timeframeSummary.upcoming)}
              {renderMetricCard('Expired', timeframeSummary.expired)}
              {renderMetricCard('Total', timeframeSummary.total)}
            </View>

            <View style={styles.searchWrapper}>
              <Ionicons name="search" size={18} color={Colors.soft} style={styles.searchIcon} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search alerts"
                placeholderTextColor={Colors.soft}
                style={styles.searchInput}
              />
            </View>

            <Text style={styles.sectionLabel}>Filter by severity</Text>
            <View style={styles.filterRow}>
              {severityFilters.map((filter) =>
                renderFilterChip(filter, selectedSeverity === filter, () =>
                  setSelectedSeverity(filter)
                )
              )}
            </View>

            <Text style={styles.sectionLabel}>Filter by timeframe</Text>
            <View style={styles.filterRow}>
              {timeframeFilters.map((filter) =>
                renderFilterChip(
                  filter.label,
                  selectedTimeframe === filter.value,
                  () => setSelectedTimeframe(filter.value)
                )
              )}
            </View>
          </View>
        }
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
    paddingTop: 12,
    paddingBottom: 20,
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.bold,
  },
  pageSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.regular,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.input,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#00000022',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.soft,
    textTransform: 'uppercase',
  },
  metricValue: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.input,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#00000022',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.bold,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.regular,
    textTransform: 'uppercase',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e3f5f8',
  },
  chipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.primary,
  },
  chipLabel: {
    fontSize: 13,
    color: Colors.regular,
  },
  chipLabelActive: {
    fontWeight: '600',
    color: Colors.bold,
  },
  alertCard: {
    backgroundColor: Colors.input,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#00000022',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  severityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  severityLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeframe: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.soft,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.bold,
    marginBottom: 6,
  },
  alertEvent: {
    fontSize: 14,
    color: Colors.regular,
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 13,
    color: Colors.soft,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.bold,
  },
  emptyCaption: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.regular,
    paddingHorizontal: 12,
  },
});
