import { Platform } from 'react-native';

// Android Emulator uses 10.0.2.2 to access host localhost
// iOS Simulator uses localhost
// Web (WSL2) needs the WSL IP address since Windows browser can't access WSL's localhost
// Real device needs the LAN IP of the server
const getLocalServerUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  if (Platform.OS === 'web') {
    // For WSL2: use the same host that the browser is using for the frontend
    // This allows it to work when accessed via localhost (with port forwarding) or via WSL IP
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `http://${host}:3000`;
  }
  return 'http://localhost:3000';
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getLocalServerUrl();
