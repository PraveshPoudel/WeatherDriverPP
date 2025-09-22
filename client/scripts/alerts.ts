import { Colors } from '@/constants/Colors';
import hexToRgba from '@/scripts/color';

const severityPalette: Record<string, string> = {
  Minor: Colors.alertMinor,
  Moderate: Colors.alertModerate,
  Severe: Colors.alertSevere,
};

export const getSeverityBaseColor = (severity: string): string => {
  return severityPalette[severity] ?? Colors.alertUnknown;
};

export const getSeverityColor = (severity: string, opacity: number = 1): string => {
  const baseColor = getSeverityBaseColor(severity);

  if (opacity >= 1) {
    return baseColor;
  }

  return hexToRgba(baseColor, opacity);
};

export const getSeverityLabel = (severity: string): string => {
  return severity && severity.trim().length > 0 ? severity : 'Unknown';
};
