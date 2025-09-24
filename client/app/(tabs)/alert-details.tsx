import React, { JSX, useMemo } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { Colors } from '@/constants/Colors';
import { getSeverityBaseColor, getSeverityColor, getSeverityLabel } from '@/scripts/alerts';
import { WeatherAlert } from '@/types/weather';

const weatherAlertData = require('../../assets/data/all_weather_alerts.json');

type Timeframe = 'active' | 'upcoming' | 'expired';

type InfoRowProps = {
  label: string;
  value: string;
};

const classifyTimeframe = (alert: WeatherAlert): Timeframe => {
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

const formatTimestamp = (value: string, withRelative: boolean = false): string => {
  const timestamp = moment(value);

  if (!timestamp.isValid()) {
    return 'Unavailable';
  }

  if (withRelative) {
    return `${timestamp.format('MMM D, YYYY h:mm A')} • ${timestamp.fromNow()}`;
  }

  return timestamp.format('MMM D, YYYY h:mm A');
};

const alertList = (weatherAlertData.alerts ?? []) as WeatherAlert[];

const InfoRow = ({ label, value }: InfoRowProps): JSX.Element => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const AlertDetailsScreen = (): JSX.Element => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const selectedAlert = useMemo(() => {
    if (!params?.id) {
      return undefined;
    }

    return alertList.find((alert) => alert.id === params.id);
  }, [params?.id]);

  if (!selectedAlert) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={48} color={Colors.soft} />
        <Text style={styles.emptyTitle}>We couldn't find that alert</Text>
        <Text style={styles.emptySubtitle}>
          The alert you're looking for may have expired or been removed from the feed.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const severityLabel = getSeverityLabel(selectedAlert.severity);
  const severityColor = getSeverityBaseColor(severityLabel);
  const timeframe = classifyTimeframe(selectedAlert);

  const timeframeLabel: Record<Timeframe, string> = {
    active: 'Active now',
    upcoming: 'Starts soon',
    expired: 'Expired',
  };

  const openExternalLink = async () => {
    if (!selectedAlert.link) {
      return;
    }

    try {
      await Linking.openURL(selectedAlert.link);
    } catch (error) {
      Alert.alert('Unable to open link', 'Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.bold} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alert details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.overviewCard}>
          <Text style={styles.alertTitle}>{selectedAlert.title}</Text>
          {selectedAlert.event?.length ? (
            <Text style={styles.alertEvent}>{selectedAlert.event}</Text>
          ) : null}

          <View style={styles.pillRow}>
            <View
              style={[
                styles.severityPill,
                {
                  backgroundColor: getSeverityColor(severityLabel, 0.15),
                  borderColor: severityColor,
                },
              ]}
            >
              <Text style={[styles.severityText, { color: severityColor }]}>{severityLabel}</Text>
            </View>
            <View style={styles.timeframePill}>
              <Ionicons name="time-outline" size={16} color={Colors.regular} />
              <Text style={styles.timeframeText}>{timeframeLabel[timeframe]}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <InfoRow label="Effective" value={formatTimestamp(selectedAlert.start, true)} />
          <InfoRow label="Expires" value={formatTimestamp(selectedAlert.end, true)} />
          <InfoRow label="Last updated" value={formatTimestamp(selectedAlert.updated, true)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impact overview</Text>
          <InfoRow label="Impacted zones" value={`${selectedAlert.geometry?.length ?? 0}`} />
          <InfoRow label="Minimum latitude" value={selectedAlert.min_lat?.toFixed(2) ?? '—'} />
          <InfoRow label="Maximum latitude" value={selectedAlert.max_lat?.toFixed(2) ?? '—'} />
          <InfoRow label="Minimum longitude" value={selectedAlert.min_lon?.toFixed(2) ?? '—'} />
          <InfoRow label="Maximum longitude" value={selectedAlert.max_lon?.toFixed(2) ?? '—'} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.sectionBody}>
            {selectedAlert.message?.length ? selectedAlert.message : 'No summary available for this alert.'}
          </Text>
        </View>

        {selectedAlert.link?.length ? (
          <TouchableOpacity style={styles.primaryButton} onPress={openExternalLink}>
            <Ionicons name="open-outline" size={18} color={Colors.background} style={styles.primaryButtonIcon} />
            <Text style={styles.primaryButtonText}>View official bulletin</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default AlertDetailsScreen;

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
  headerSpacer: {
    width: 36,
    height: 36,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  overviewCard: {
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
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.bold,
    marginBottom: 8,
  },
  alertEvent: {
    fontSize: 15,
    color: Colors.regular,
    marginBottom: 16,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityPill: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    marginRight: 10,
  },
  severityText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  timeframePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  timeframeText: {
    marginLeft: 6,
    fontSize: 13,
    color: Colors.regular,
    fontWeight: '600',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.bold,
    marginBottom: 12,
  },
  sectionBody: {
    fontSize: 14,
    color: Colors.regular,
    lineHeight: 20,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.soft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    marginTop: 2,
    fontSize: 15,
    color: Colors.bold,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 10,
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
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: 24,
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
});
