import {IonFab, IonFabButton, IonIcon, IonLabel, IonLoading} from '@ionic/react';
import {saveOutline} from 'ionicons/icons';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {BackupService} from '../../lib/services/backup.service';
import {RootState} from '../../lib/store/reducers';
import {Settings} from '../../lib/types/settings';
import {emitError} from '../../lib/utils/utils.events';
import styles from './BackupInvoices.module.scss';

export const BackupInvoices = () => {
  const {t} = useTranslation(['backup', 'common']);

  const [showLoading, setShowLoading] = useState(false);

  const settings: Settings = useSelector((state: RootState) => state.settings.settings);

  async function doBackup() {
    setShowLoading(true);

    try {
      await BackupService.getInstance().backup('excel', settings);
    } catch (err) {
      emitError(err);
    }

    setShowLoading(false);
  }

  return (
    <>
      <IonFab vertical="bottom" horizontal="end" slot="fixed" className={`${styles.backup}`}>
        <IonFabButton onClick={() => doBackup()} color="button">
          <IonIcon icon={saveOutline} />
        </IonFabButton>

        <IonLabel>{t('backup:backup_invoices')}</IonLabel>
      </IonFab>

      <IonLoading isOpen={showLoading} message={t('common:actions.wait')} />
    </>
  );
};
