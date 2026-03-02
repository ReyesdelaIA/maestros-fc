import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.maestrosfc.app',
  appName: 'Maestros FC',
  webDir: 'www',
  server: {
    url: serverUrl || 'https://maestros-fc.vercel.app',
    // Necesario para apuntar a http://IP_LOCAL en desarrollo.
    cleartext: true,
  },
};

export default config;
