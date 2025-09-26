import { Colors } from '@/constants/Colors';
import hexToRgba from '@/scripts/color';

const severityPalette = {
  Minor: Colors.alertMinor,
  Moderate: Colors.alertModerate,
  Severe: Colors.alertSevere,
};

export function getSeverityBaseColor(severity) {
  return severityPalette[severity] || Colors.alertUnknown;
}

export function getSeverityColor(severity, opacity = 1) {
  const baseColor = getSeverityBaseColor(severity);
  if (opacity >= 1) {
    return baseColor;
  }
  return hexToRgba(baseColor, opacity);
}

export function getSeverityLabel(severity) {
  if (!severity) {
    return 'Unknown';
  }
  const trimmed = String(severity).trim();
  return trimmed.length > 0 ? trimmed : 'Unknown';
}
