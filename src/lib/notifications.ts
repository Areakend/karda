import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDER_HOUR = 19;
const REMINDER_MINUTE = 0;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'Rappels de révision',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * Active un rappel quotidien local à 19h. Retourne false si la permission
 * système a été refusée — l'appelant doit alors garder le réglage désactivé.
 */
export async function enableDailyReminder(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  await ensureAndroidChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Karda',
      body: "Quelques minutes de lecture arménienne t'attendent — garde ta série 🔥",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: REMINDER_HOUR,
      minute: REMINDER_MINUTE,
    },
  });
  return true;
}

export async function disableDailyReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
