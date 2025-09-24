import React, { JSX, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { Colors } from '@/constants/Colors';
import { getSeverityBaseColor, getSeverityColor, getSeverityLabel } from '@/scripts/alerts';
import { WeatherAlert } from '@/types/weather';

const weatherAlertData = require('../../assets/data/all_weather_alerts.json');

const severityFilters = ['All', 'Minor', 'Moderate', 'Severe'];

const timeframeFilters = [
  { label: 'Active', value: 'active' as const },
  { label: 'Upcoming', value: 'upcoming' as const },
  { label: 'Expired', value: 'expired' as const },
  { label: 'All', value: 'all' as const },
];

type TimeframeValue = 'active' | 'upcoming' | 'expired' | 'all';

type AlertWithTimeframe = WeatherAlert & { timeframe: Exclude<TimeframeValue, 'all'> };

const classifyTimeframe = (alert: WeatherAlert): AlertWithTimeframe['timeframe'] => {
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

const formatTimeRange = (alert: WeatherAlert): string => {
  const start = moment(alert.start);
  const end = moment(alert.end);

  if (start.isValid() && end.isValid()) {
    return `${start.format('MMM D, h:mm A')} - ${end.format('MMM D, h:mm A')}`;
  }

  if (start.isValid()) {
    return `Starts ${start.fromNow()}`;
  }

  if (end.isValid()) {
    return `Ends ${end.fromNow()}`;
  }

  return 'Timing unavailable';
};

const getAlertList = (): WeatherAlert[] => {
  return (weatherAlertData.alerts ?? []) as WeatherAlert[];
};

const WeatherAlertsScreen = (): JSX.Element => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeValue>('active');

  const allAlerts = useMemo(() => getAlertList(), []);

  const alertsWithTimeframe = useMemo<AlertWithTimeframe[]>(() => {
    return allAlerts.map((alert) => ({
      ...alert,
      timeframe: classifyTimeframe(alert),
    }));
  }, [allAlerts]);

  const timeframeSummary = useMemo(() => {
    return alertsWithTimeframe.reduce<Record<'active' | 'upcoming' | 'expired', number>>(
      (acc, alert) => {
        acc[alert.timeframe] += 1;
        return acc;
      },
      { active: 0, upcoming: 0, expired: 0 }
    );
  }, [alertsWithTimeframe]);

  const filteredAlerts = useMemo<AlertWithTimeframe[]>(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return alertsWithTimeframe.filter((alert) => {
      const severityLabel = getSeverityLabel(alert.severity);
      const matchesSeverity =
        selectedSeverity === 'All' || severityLabel === selectedSeverity;

      const matchesTimeframe =
        selectedTimeframe === 'all' || alert.timeframe === selectedTimeframe;

      const matchesSearch = normalizedQuery.length === 0
        ? true
        : [alert.title, alert.message, alert.event]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedQuery));

      return matchesSeverity && matchesTimeframe && matchesSearch;
    });
  }, [alertsWithTimeframe, searchQuery, selectedSeverity, selectedTimeframe]);

  const renderAlertCard: ListRenderItem<AlertWithTimeframe> = ({ item }) => {
    const severityLabel = getSeverityLabel(item.severity);
    const severityColor = getSeverityBaseColor(severityLabel);

    return (
      <TouchableOpacity
        style={styles.alertCard}
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: '/(tabs)/alert-details',
            params: { id: item.id },
          })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View
            style={[
              styles.severityPill,
              {
                backgroundColor: getSeverityColor(severityLabel, 0.15),
                borderColor: severityColor,
              },
            ]}
          >
            <Text style={[styles.severityText, { color: severityColor }]}>
              {severityLabel}
            </Text>
          </View>
        </View>
        {item.event?.length ? (
          <Text style={styles.cardEvent} numberOfLines={1}>
            {item.event}
          </Text>
        ) : null}
        {item.message?.length ? (
          <Text style={styles.cardMessage} numberOfLines={3}>
            {item.message}
          </Text>
        ) : null}
        <View style={styles.cardFooter}>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={16} color={Colors.regular} />
            <Text style={styles.metaText}>{formatTimeRange(item)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="navigate-outline" size={16} color={Colors.regular} />
            <Text style={styles.metaText}>{item.timeframe.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.cardLinkRow}>
          <Text style={styles.cardLinkText}>View details</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.regular}
            style={styles.cardLinkIcon}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderSeverityChip = (option: string): JSX.Element => {
    const isSelected = option === selectedSeverity;
    const baseColor =
      option === 'All' ? Colors.regular : getSeverityBaseColor(option);

    return (
      <TouchableOpacity
        key={option}
        style={[
          styles.filterChip,
          isSelected && {
            backgroundColor:
              option === 'All'
                ? Colors.secondary
                : getSeverityColor(option, 0.15),
            borderColor: baseColor,
          },
        ]}
        onPress={() => setSelectedSeverity(option)}
      >
        <Text
          style={[
            styles.filterChipText,
            isSelected && { color: baseColor },
          ]}
        >
          {option}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTimeframeChip = (label: string, value: TimeframeValue): JSX.Element => {
    const isSelected = value === selectedTimeframe;

    return (
      <TouchableOpacity
        key={value}
        style={[
          styles.filterChip,
          isSelected && {
            backgroundColor: Colors.secondary,
            borderColor: Colors.regular,
          },
        ]}
        onPress={() => setSelectedTimeframe(value)}
      >
        <Text
          style={[
            styles.filterChipText,
            isSelected && { color: Colors.regular },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.bold} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weather alerts</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push('/(tabs)/map')}
        >
          <Ionicons name="map-outline" size={22} color={Colors.bold} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{timeframeSummary.active}</Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{timeframeSummary.upcoming}</Text>
          <Text style={styles.summaryLabel}>Upcoming</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{timeframeSummary.expired}</Text>
          <Text style={styles.summaryLabel}>Expired</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.regular} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search alerts"
          placeholderTextColor={Colors.soft}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      <Text style={styles.filterLabel}>Severity</Text>
      <View style={styles.filterRow}>
        {severityFilters.map(renderSeverityChip)}
      </View>

      <Text style={styles.filterLabel}>Timeline</Text>
      <View style={styles.filterRow}>
        {timeframeFilters.map(({ label, value }) => renderTimeframeChip(label, value))}
      </View>

      <FlatList
        data={filteredAlerts}
        renderItem={renderAlertCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="sunny-outline" size={42} color={Colors.soft} />
            <Text style={styles.emptyTitle}>No alerts match your filters</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting the severity or timeframe to explore a different set of
              weather advisories.
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default WeatherAlertsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.input,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#0000000d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.bold,
  },
  summaryLabel: {
    marginTop: 4,
    color: Colors.regular,
    fontSize: 13,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.input,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#0000000d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: Colors.bold,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.regular,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterChip: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff80',
    borderWidth: 1,
    borderColor: '#ffffff',
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipText: {
    fontSize: 13,
    color: Colors.soft,
  },
  listContent: {
    paddingBottom: 120,
  },
  alertCard: {
    backgroundColor: Colors.input,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0000000d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.bold,
    marginRight: 12,
  },
  severityPill: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  severityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardEvent: {
    fontSize: 14,
    color: Colors.regular,
    marginBottom: 4,
  },
  cardMessage: {
    fontSize: 13,
    color: Colors.regular,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: Colors.soft,
    marginLeft: 6,
  },
  cardLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cardLinkText: {
    fontSize: 13,
    color: Colors.regular,
    fontWeight: 'bold',
  },
  cardLinkIcon: {
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.bold,
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    color: Colors.regular,
  },
});
