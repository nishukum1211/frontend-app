import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { getUserData } from '../auth/action'; // Import DecodedToken type
import { getLoginJwtToken } from '../auth/auth';
import { AppConfig } from "../config";
import { getDeviceInfo } from '../utils/deviceInfo';


import type { DeviceInfo } from '../utils/deviceInfo';
const EXPO_PUSH_TOKEN_KEY = 'expo_push_token';

export interface TokenRequest {
  user_id: string;
  expo_token: string;
  device: DeviceInfo;
  request_date: string;
}

/**
 * A service class to handle push notification registration.
 */
class NotificationService {
  /**
   * Registers the device for push notifications and sends the Expo push token to the backend.
   * It checks for permissions and only works on physical devices.
   */
  public async registerForPushNotificationsAsync(): Promise<string | null> {
    // if (!Constants.isDevice) {
    //   console.warn('Push notifications are only available on physical devices.');
    //   return null;
    // }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.error('Failed to get push token for push notification!');
      return null;
    }

    const newToken = (await Notifications.getExpoPushTokenAsync()).data;
    const storedToken = await AsyncStorage.getItem(EXPO_PUSH_TOKEN_KEY);

    const userData = await getUserData();
    if (!userData) {
      // This can happen on app startup before login. We have the token, but no user data yet.
      console.log('User not logged in. Skipping sending push token to backend for now.');
      return newToken;
    }

    // Only send the token to the backend if it's new or has changed.
    if (newToken && newToken !== storedToken) {
      console.log('New or updated push token found, sending to backend.');
      const deviceInfo = await getDeviceInfo();
      const payload: TokenRequest = {
        user_id: userData.id,
        expo_token: newToken,
        device: deviceInfo,
        request_date: new Date().toISOString(),
      };
      await this.sendTokenToBackend(payload);
      // If the token was sent successfully, store it locally.
      await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, payload.expo_token);
    }

    return newToken;
  }

  /**
   * Sends the push token to your backend server.
   * @param payload The token request payload.
   */
  private async sendTokenToBackend(payload: TokenRequest): Promise<void> {
    console.log('Sending push token to backend:', payload);
    try {
      const token = await getLoginJwtToken();
      if (!token) {
        console.error("Authentication error. Please log in again.");
        return;
      }
      await fetch(`${AppConfig.API_BASE_URL}/notification/register-device`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Error sending push token to backend:', error);
      // Optionally, you could re-throw the error to handle it in the calling function.
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;