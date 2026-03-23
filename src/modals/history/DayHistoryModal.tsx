import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import {close} from 'ionicons/icons';
import {format as fnsFormat, subDays} from 'date-fns';

import styles from './HistoryModal.module.scss';

import {RootState} from '../../store/reducers';
import {Settings} from '../../models/settings';
import {formatCurrency} from '../../utils/utils.currency';
import {formatTime} from '../../utils/utils.time';

interface DayResult {
  day: Date;
  milliseconds: number;
  billable: number;
}

interface Props {
  closeAction: () => void;
}

const DayHistoryModal: React.FC<Props> = ({closeAction}) => {
  const settings: Settings = useSelector((state: RootState) => state.settings.settings);
  const [days, setDays] = useState<DayResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Past 30 days, most recent first (excluding today — today is shown on the home card)
    const pastDays: Date[] = Array.from({length: 30}, (_, i) => subDays(new Date(), i + 1));

    const worker = new Worker('./workers/summary.js');

    worker.onmessage = ($event: MessageEvent) => {
      if ($event?.data?.days) {
        const results: DayResult[] = $event.data.days.map((d: any, i: number) => ({
          day: pastDays[i],
          milliseconds: d.milliseconds,
          billable: d.billable,
        }));
        setDays(results);
      }
      setLoading(false);
      worker.terminate();
    };

    worker.postMessage({msg: 'compute', days: pastDays});

    return () => worker.terminate();
  }, []);

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Day History</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={closeAction}>
              <IonIcon icon={close} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding-start ion-padding-end ion-padding-bottom">
        {loading ? (
          <p className={styles.empty}>Loading…</p>
        ) : (
          <div className={styles.grid}>
            {days.map((d, i) => (
              <IonCard key={i} className={styles.card} color="card">
                <h2 className={styles.cardTitle}>
                  {fnsFormat(d.day, 'EEEE, MMM dd yyyy')}
                </h2>
                <IonCardHeader className={styles.header}>
                  <IonCardSubtitle className={styles.subtitle}>
                    <label>Tracked: </label>
                    {formatTime(d.milliseconds)}
                  </IonCardSubtitle>
                  <IonCardTitle>
                    <label>Billable: </label>
                    {formatCurrency(d.billable, settings.currency.currency)}
                  </IonCardTitle>
                </IonCardHeader>
              </IonCard>
            ))}
          </div>
        )}
      </IonContent>
    </>
  );
};

export default DayHistoryModal;
