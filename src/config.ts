import { Platform } from 'react-native';

// Android Emulator uses 10.0.2.2 to access host localhost
// iOS Simulator uses localhost
// Real device needs the LAN IP of the server
const LOCAL_SERVER_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000' 
  : 'http://localhost:3000';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || LOCAL_SERVER_URL;
