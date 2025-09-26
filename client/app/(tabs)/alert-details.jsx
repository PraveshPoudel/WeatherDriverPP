import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { Colors } from '@/constants/Colors';
import { getSeverityColor, getSeverityLabel } from '@/utils/alerts';

const weatherAlertData = require('../../assets/data/all_weather_alerts.json');

const classifyTimeframe = (alert) => {
  const now = moment();
  const start = moment(alert.start);
  const end = moment(alert.end);

  if (start.isValid() && now.isBefore(start)) {
    return 'Upcoming';
  }

  if (end.isValid() && now.isAfter(end)) {
    return 'Expired';
  }

  return 'Active';
};

const formatTimestamp = (value) => {
  const parsed = moment(value);
  if (!parsed.isValid()) {
    return 'Unavailable';
  }
  return parsed.format('dddd, MMMM D • h:mm A');
};

const formatRelative = (value) => {
  const parsed = moment(value);
  if (!parsed.isValid()) {
    return null;
  }
  return parsed.fromNow();
};

const findAlertById = (id) => {
  if (!id) {
    return null;
  }

  const alerts = weatherAlertData && weatherAlertData.alerts;
  if (!Array.isArray(alerts)) {
    return null;
  }

  return alerts.find((item) => item.id === id) || null;
};

export default function AlertDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const alert = useMemo(() => findAlertById(id), [id]);

  if (!alert) {
    return (
      <View style={styles.missingContainer}>
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={48} color={Colors.caution} />
        <Text style={styles.missingTitle}>Alert not found</Text>
        <Text style={styles.missingMessage}>
          We couldn't load the requested weather alert. Please return to the alerts list and
          try again.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="#fff" />
          <Text style={styles.backButtonLabel}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const severityLabel = getSeverityLabel(alert.severity);
  const severityColor = getSeverityColor(severityLabel);
  const timeframe = classifyTimeframe(alert);

  const startDisplay = formatTimestamp(alert.start);
  const endDisplay = formatTimestamp(alert.end);
  const updatedDisplay = formatTimestamp(alert.updated);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <TouchableOpacity
          accessible
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.bold} />
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <Text style={styles.heroEyebrow}>{timeframe} alert</Text>
          <Text style={styles.heroTitle}>{alert.title || 'Weather alert'}</Text>
          <View
            style={[
              styles.heroSeverity,
              { backgroundColor: getSeverityColor(severityLabel, 0.15) },
            ]}
          >
            <Ionicons name="warning" size={16} color={severityColor} />
            <Text style={[styles.heroSeverityLabel, { color: severityColor }]}>
              {severityLabel}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timelineCard}>
            <View style={styles.timelineRow}>
              <Ionicons name="play-circle" size={18} color={Colors.primary} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Starts</Text>
                <Text style={styles.timelineValue}>{startDisplay}</Text>
                {formatRelative(alert.start) ? (
                  <Text style={styles.timelineHint}>{formatRelative(alert.start)}</Text>
                ) : null}
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.timelineRow}>
              <Ionicons name="stop-circle" size={18} color={Colors.primary} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Ends</Text>
                <Text style={styles.timelineValue}>{endDisplay}</Text>
                {formatRelative(alert.end) ? (
                  <Text style={styles.timelineHint}>{formatRelative(alert.end)}</Text>
                ) : null}
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.timelineRow}>
              <Ionicons name="refresh-circle" size={18} color={Colors.primary} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Updated</Text>
                <Text style={styles.timelineValue}>{updatedDisplay}</Text>
                {formatRelative(alert.updated) ? (
                  <Text style={styles.timelineHint}>{formatRelative(alert.updated)}</Text>
                ) : null}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryCard}>
            {alert.event ? (
              <Text style={styles.summaryEyebrow}>{alert.event}</Text>
            ) : null}
            <Text style={styles.summaryMessage}>{alert.message}</Text>
          </View>
        </View>

        {alert.link ? (
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => Linking.openURL(alert.link)}
          >
            <View>
              <Text style={styles.linkTitle}>Official bulletin</Text>
              <Text style={styles.linkSubtitle}>Open the full statement from the issuing office.</Text>
            </View>
            <Ionicons name="open-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: Colors.input,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#00000022',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  heroContent: {
    gap: 12,
  },
  heroEyebrow: {
    fontSize: 13,
    color: Colors.soft,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: Colors.bold,
  },
  heroSeverity: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  heroSeverityLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 24,
    paddingBottom: 64,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.bold,
  },
  timelineCard: {
    backgroundColor: Colors.input,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 18,
    shadowColor: '#00000012',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  timelineContent: {
    flex: 1,
    gap: 2,
  },
  timelineLabel: {
    fontSize: 13,
    color: Colors.soft,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  timelineValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.bold,
  },
  timelineHint: {
    fontSize: 13,
    color: Colors.regular,
  },
  divider: {
    height: 1,
    backgroundColor: '#e4f2f6',
  },
  summaryCard: {
    backgroundColor: Colors.input,
    borderRadius: 20,
    padding: 20,
    gap: 8,
    shadowColor: '#00000012',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  summaryEyebrow: {
    fontSize: 13,
    color: Colors.soft,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  summaryMessage: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.regular,
  },
  linkCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#00000010',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  linkSubtitle: {
    fontSize: 13,
    color: Colors.regular,
    marginTop: 4,
  },
  missingContainer: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: Colors.background,
  },
  missingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.bold,
  },
  missingMessage: {
    textAlign: 'center',
    fontSize: 15,
    color: Colors.regular,
    lineHeight: 22,
  },
  backButton: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  backButtonLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
