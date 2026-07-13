import {
  ELocalNotificationTriggerUnit,
  LocalNotifications,
} from '@awesome-cordova-plugins/local-notifications';
import {isPlatform} from '@ionic/react';
import i18next from 'i18next';
import type {Project} from '../types/project';
import type {Settings} from '../types/settings';
import {isNullish} from '../utils/utils.nullish';

export class NotificationsService {
  static #instance: NotificationsService;

  private constructor() {}

  static getInstance() {
    if (isNullish(NotificationsService.#instance)) {
      NotificationsService.#instance = new NotificationsService();
    }
    return NotificationsService.#instance;
  }

  async schedule(project: Project, settings: Settings): Promise<void> {
    if (!isPlatform('hybrid')) {
      return;
    }

    if (isNullish(project?.data)) {
      return;
    }

    if (isNullish(settings?.notifications)) {
      return;
    }

    await i18next.loadNamespaces('notifications');

    LocalNotifications.schedule({
      title: project.data.client
        ? `${project.data.client.name}`
        : i18next.t('notifications:fallback_title'),
      text: i18next.t('notifications:body', {project: project.data.name}),
      trigger: {
        every: ELocalNotificationTriggerUnit.HOUR,
      },
    });
  }

  async cancel(): Promise<void> {
    if (!isPlatform('hybrid')) {
      return;
    }

    await LocalNotifications.cancelAll();
  }
}
