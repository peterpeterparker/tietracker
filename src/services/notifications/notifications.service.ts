import {isPlatform} from '@ionic/react';

import i18next from 'i18next';

import {Project} from '../../models/project';

import {Settings} from '../../models/settings';

import {LocalNotifications, ELocalNotificationTriggerUnit} from '@ionic-native/local-notifications';

export class NotificationsService {
  private static instance: NotificationsService;

  private constructor() {
    // Private constructor, singleton
  }

  static getInstance() {
    if (!NotificationsService.instance) {
      NotificationsService.instance = new NotificationsService();
    }
    return NotificationsService.instance;
  }

  schedule(project: Project, settings: Settings): Promise<void> {
    return new Promise<void>(async (resolve) => {
      if (!isPlatform('hybrid')) {
        resolve();
        return;
      }

      if (!project || !project.data) {
        resolve();
        return;
      }

      if (!settings || !settings.notifications) {
        resolve();
        return;
      }

      await i18next.loadNamespaces('notifications');

      LocalNotifications.schedule({
        title: project.data.client ? `${project.data.client.name}` : i18next.t('notifications:fallback_title'),
        text: i18next.t('notifications:body', {project: project.data.name}),
        trigger: {
          every: ELocalNotificationTriggerUnit.HOUR,
        },
      });

      resolve();
    });
  }

  cancel(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      if (!isPlatform('hybrid')) {
        resolve();
        return;
      }

      await LocalNotifications.cancelAll();

      resolve();
    });
  }
}
