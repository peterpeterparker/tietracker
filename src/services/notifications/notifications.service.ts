import {isPlatform} from '@ionic/react';

import i18next from 'i18next';

import {Project} from '../../models/project';

import {LocalNotificationPendingList, Plugins} from '@capacitor/core';
import {Settings} from '../../models/settings';
const {LocalNotifications} = Plugins;

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

            if (!settings || !settings.notifications || settings.notifications.count === 0) {
                resolve();
                return;
            }

            await i18next.loadNamespaces('notifications');

            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: project.data.client ? `${project.data.client.name}` : i18next.t('notifications:fallback_title'),
                        body: i18next.t('notifications:body', { project: project.data.name }),
                        id: 1,
                        schedule: {
                            every: settings.notifications.every,
                            count: settings.notifications.count
                        }
                    }
                ]
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

            const pendingList: LocalNotificationPendingList = await LocalNotifications.getPending();

            if (!pendingList || !pendingList.notifications || pendingList.notifications.length <= 0) {
                resolve();
                return;
            }

            await LocalNotifications.cancel(pendingList);

            resolve();
        });
    }

}
