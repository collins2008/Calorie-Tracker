import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.collins.recomptracker',
  appName: 'RecompTracker',
  webDir: 'dist',
  backgroundColor: '#09090b',
  android: {
    backgroundColor: '#09090b',
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#09090b',
    },
  },
};

export default config;
