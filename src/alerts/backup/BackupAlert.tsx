import React, {useEffect, useState} from 'react';

import {IonAlert, IonLoading, isPlatform} from '@ionic/react';

import {useTranslation} from 'react-i18next';

import {isChrome, isHttps} from '../../utils/utils.platform';

import {rootConnector} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import {BackupService} from '../../services/backup/backup.service';
import {Settings} from '../../models/settings';
import {useSelector} from 'react-redux';

const BackupAlert: React.FC = () => {

    const {t} = useTranslation(['backup', 'common']);

    const settings: Settings = useSelector((state: RootState) => state.settings.settings);

    const [showAlertBackup, setShowAlertBackup] = useState(false);
    const [showLoading, setShowLoading] = useState(false);

    // TODO: Settings on/off

    useEffect(() => {
        initBackup();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function initBackup() {
        const needBackup = await BackupService.getInstance().needBackup();
        setShowAlertBackup(needBackup);
    }

    async function cancel() {
        await BackupService.getInstance().setBackup();
    }

    async function doExport() {
        setShowLoading(true);

        if (isPlatform('desktop') && isChrome() && isHttps()) {
            await BackupService.getInstance().exportNativeFileSystem(settings.currency, settings.vat);
        } else if (isPlatform('hybrid')) {
            await BackupService.getInstance().exportMobileFileSystem(settings.currency, settings.vat);
        } else  {
            await BackupService.getInstance().exportDownload(settings.currency, settings.vat);
        }

        await BackupService.getInstance().setBackup();

        setShowLoading(false);
    }

    return <>
        <IonAlert
            isOpen={showAlertBackup}
            onDidDismiss={() => setShowAlertBackup(false)}
            header={t('backup:title')}
            message={t('backup:message')}
            buttons={[
                {
                    text: t('common:actions.cancel'),
                    role: 'cancel',
                    handler: async () => {
                        await cancel();
                    }
                },
                {
                    text: t('common:actions.export'),
                    handler: async () => {
                        await doExport();
                    }
                }
            ]}
        />

        <IonLoading
            isOpen={showLoading}
            onDidDismiss={() => setShowLoading(false)}
            message={t('common:actions.wait')}
        />
    </>
};

export default rootConnector(BackupAlert);
