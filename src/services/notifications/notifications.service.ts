import {LocalNotificationEnabledResult, LocalNotificationPendingList, Plugins} from '@capacitor/core';
import {isPlatform} from '@ionic/react';
import {Project} from '../../models/project';

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

    schedule(project: Project): Promise<void> {
        return new Promise<void>(async (resolve) => {
            if (!isPlatform('hybrid')) {
                resolve();
                return;
            }

            if (!project || !project.data) {
                resolve();
                return;
            }

            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: project.data.name,
                        body: project.data.client ? `Tracking work for ${project.data.client.name}` : 'Tracking work in progress',
                        id: 1,
                        schedule: {
                            every: 'second',
                            count: 60
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
