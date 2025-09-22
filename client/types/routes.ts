import { LatLng } from 'react-native-maps';
import { AlertSummary } from './weather';

export interface SavedRoute {
  id: string;
  savedAt: string;
  originLabel: string;
  destinationLabel: string;
  distanceText: string;
  durationText: string;
  arrivalTime?: string;
  coordinates: LatLng[];
  alertSummaries: AlertSummary[];
}
