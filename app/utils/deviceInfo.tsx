import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Localization from 'expo-localization';
import { Platform } from 'react-native';

export interface DeviceInfo {
  platform: typeof Platform.OS;

  // Device
  device_name: string | null;
  brand: string | null;
  manufacturer: string | null;
  model_name: string | null;

  os_name: string | null;
  os_version: string | null;

  // App
  app_version: string | null;
  build_version: string | null;

  // Expo
  expo_runtime_version: string | null;

  // Localization
  timezone: string | null;
  uses_24_hour_clock: boolean | null;
  first_weekday: number | null;

  locale: string | null;
  region: string | null;
  currency: string | null;
  measurement_system: 'metric' | 'us' | 'uk' | null;
  temperature_unit: 'celsius' | 'fahrenheit' | null;
}



export function getDeviceInfo(): DeviceInfo {
  const calendars = Localization.getCalendars();
  const locales = Localization.getLocales();

  return {
    platform: Platform.OS,

    // Device
    device_name: Device.deviceName ?? null,
    brand: Device.brand ?? null,
    manufacturer: Device.manufacturer ?? null,
    model_name: Device.modelName ?? null,

    os_name: Device.osName ?? null,
    os_version: Device.osVersion ?? null,

    // App
    app_version: Application.nativeApplicationVersion ?? null,
    build_version: Application.nativeBuildVersion ?? null,

    // Expo
    expo_runtime_version: Constants.manifest2?.runtimeVersion ?? null,

    // ✅ Localization (from arrays)
    timezone: calendars[0]?.timeZone ?? null,
    uses_24_hour_clock: calendars[0]?.uses24hourClock ?? null,
    first_weekday: calendars[0]?.firstWeekday ?? null,

    locale: locales[0]?.languageTag ?? null,
    region: locales[0]?.regionCode ?? null,
    currency: locales[0]?.currencyCode ?? null,
    measurement_system: locales[0]?.measurementSystem ?? null,
    temperature_unit: locales[0]?.temperatureUnit ?? null,
  };
}
