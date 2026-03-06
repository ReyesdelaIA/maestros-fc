import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.maestrosfc.app',
  appName: 'Maestros FC',
  webDir: 'www',
  server: {
    url: serverUrl || 'https://maestros-fc.vercel.app',
    cleartext: true,
    allowNavigation: [
      'maestros-fc.vercel.app',
      '*.vercel.app',
      '*.supabase.co',
      'accounts.google.com',
      '*.google.com',
      '*.googleapis.com',
      '*.gstatic.com',
    ],
  },
};

export default config;
