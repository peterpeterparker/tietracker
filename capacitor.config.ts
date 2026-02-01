import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tietracker.app',
  appName: 'Tie Tracker',
  webDir: 'dist',
  cordova: {},
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      androidScaleType: 'CENTER_CROP',
    },
  },
};

export default config;
