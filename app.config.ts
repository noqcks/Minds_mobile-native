import { ExpoConfig, ConfigContext } from 'expo/config';
import Tenant from './tenant.json';

type ResizeType = 'cover' | 'contain';

/**
 * Configuration settings for the minds / multi-tenant app, using environment variables.
 */

const name = Tenant.APP_NAME;
const theme = Tenant.THEME;
const is_dark = theme === 'dark';

const extraUpdate: any =
  Tenant.APP_SLUG === 'mindspreview'
    ? {
        checkAutomatically: 'NEVER',
        fallbackToCacheTimeout: 0,
      }
    : {};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name,
  scheme: Tenant.APP_SCHEME,
  slug: Tenant.APP_SLUG || 'minds',
  version: process.env.MINDS_APP_VERSION || '5.0.0',
  icon: './assets/images/icon.png',
  orientation: 'portrait',
  runtimeVersion: {
    policy: 'appVersion',
  },
  plugins: [
    'react-native-iap',
    'expo-updates',
    './node_modules/react-native-notifications/app.plugin.js',
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 33,
          targetSdkVersion: 33,
          buildToolsVersion: '33.0.0',
          kotlinVersion: '1.8.0',
        },
        ios: {
          deploymentTarget: '13.0',
          flipper: false,
        },
      },
    ],
    [
      'expo-media-library',
      {
        photosPermission: 'This lets you share photos from your library',
        savePhotosPermission: 'This lets you save photos to your camera roll',
        isAccessMediaLocationEnabled: true,
      },
    ],
    [
      'react-native-vision-camera',
      {
        cameraPermissionText: '$(PRODUCT_NAME) needs access to your Camera.',
        enableMicrophonePermission: true,
        microphonePermissionText:
          '$(PRODUCT_NAME) needs access to your Microphone.',
      },
    ],
  ],
  android: {
    package: Tenant.APP_ANDROID_PACKAGE,
    adaptiveIcon: Tenant.ADAPTIVE_ICON
      ? {
          foregroundImage: Tenant.ADAPTIVE_ICON,
          backgroundColor: Tenant.ADAPTIVE_COLOR,
        }
      : undefined,
    versionCode: process.env.MINDS_APP_BUILD
      ? parseInt(process.env.MINDS_APP_BUILD, 10)
      : 310190,
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: Tenant.APP_HOST || 'www.minds.com',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
    splash: {
      image: './assets/images/splash.png',
      resizeMode: Tenant.APP_SPLASH_RESIZE as ResizeType,
      backgroundColor: is_dark ? '#1C1D1F' : '#F6F7F7',
    },
    permissions: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.ACCESS_MEDIA_LOCATION',
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
    ],
    googleServicesFile: './google-services.json',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: Tenant.APP_IOS_BUNDLE,
    buildNumber: process.env.MINDS_APP_BUILD || '201907230460',
    associatedDomains: Tenant.APP_HOST
      ? [
          'applinks:' + Tenant.APP_HOST,
          'activitycontinuation:' + Tenant.APP_HOST,
          'webcredentials:' + Tenant.APP_HOST,
        ]
      : [
          'applinks:www.minds.com',
          'activitycontinuation:www.minds.com',
          'webcredentials:www.minds.com',
        ],
    infoPlist: {
      LSApplicationQueriesSchemes: ['mindschat'],
      NSPhotoLibraryUsageDescription:
        'This lets you share photos from your library',
      NSPhotoLibraryAddUsageDescription:
        'This lets you save photos to your camera roll',
      NSCameraUsageDescription: '$(PRODUCT_NAME) needs access to your Camera.',
      NSMicrophoneUsageDescription:
        '$(PRODUCT_NAME) needs access to your Microphone.',
    },
    splash: {
      image: './assets/images/splash.png',
      resizeMode: Tenant.APP_SPLASH_RESIZE as ResizeType,
      backgroundColor: is_dark ? '#1C1D1F' : '#F6F7F7',
    },
  },
  notification: {
    icon: './assets/images/icon_mono.png',
    color: Tenant.ACCENT_COLOR_LIGHT,
    iosDisplayInForeground: true,
  },
  extra: {
    eas: {
      projectId:
        Tenant.EAS_PROJECT_ID || '7a92bc49-6d7e-468f-af13-0a9aff39fc0e',
    },
  },
  updates: {
    ...extraUpdate,
    url: `https://u.expo.dev/${
      Tenant.EAS_PROJECT_ID || '7a92bc49-6d7e-468f-af13-0a9aff39fc0e'
    }`,
  },
  owner: 'minds-inc',
});
