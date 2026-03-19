// API base URL. Use your machine's IP (e.g. 192.168.1.x) when running on a physical device.
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:8000`;
  }
  return Platform.OS === 'web' ? 'http://localhost:8000' : 'http://localhost:8000';
};

export const API_BASE_URL = getBaseUrl();
