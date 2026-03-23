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
import {
  eachDayOfInterval,
  endOfWeek,
  format as fnsFormat,
  startOfWeek,
  subWeeks,
} from 'date-fns';

import styles from './HistoryModal.module.scss';

import {RootState} from '../../store/reducers';
import {Settings} from '../../models/settings';
import {formatCurrency} from '../../utils/utils.currency';
import {formatTime} from '../../utils/utils.time';

interface WeekResult {
  weekStart: Date;
  weekEnd: Date;
  milliseconds: number;
  billable: number;
}

interface Props {
  closeAction: () => void;
}

const WeekHistoryModal: React.FC<Props> = ({closeAction}) => {
  const settings: Settings = useSelector((state: RootState) => state.settings.settings);
  const [weeks, setWeeks] = useState<WeekResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    // Past 12 weeks, most recent first (excluding current week)
    const weekRanges = Array.from({length: 12}, (_, i) => {
      const ref = subWeeks(now, i + 1);
      return {
        weekStart: startOfWeek(ref, {weekStartsOn: 1}),
        weekEnd: endOfWeek(ref, {weekStartsOn: 1}),
      };
    });

    // Flatten all days in order to send to worker in one shot,
    // then re-group results back into weeks.
    const allDays: Date[] = weekRanges.flatMap(({weekStart, weekEnd}) =>
      eachDayOfInterval({start: weekStart, end: weekEnd}),
    );

    const worker = new Worker('./workers/summary.js');

    worker.onmessage = ($event: MessageEvent) => {
      if ($event?.data?.days) {
        const rawDays: {milliseconds: number; billable: number}[] = $event.data.days;

        // rawDays is flat (84 days = 12 × 7); re-group into weeks of 7
        const results: WeekResult[] = weekRanges.map(({weekStart, weekEnd}, wi) => {
          const slice = rawDays.slice(wi * 7, wi * 7 + 7);
          return {
            weekStart,
            weekEnd,
            milliseconds: slice.reduce((sum, d) => sum + d.milliseconds, 0),
            billable: slice.reduce((sum, d) => sum + d.billable, 0),
          };
        });

        setWeeks(results);
      }
      setLoading(false);
      worker.terminate();
    };

    worker.postMessage({msg: 'compute', days: allDays});

    return () => worker.terminate();
  }, []);

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Week History</IonTitle>
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
            {weeks.map((w, i) => (
              <IonCard key={i} className={styles.card} color="card">
                <h2 className={styles.cardTitle}>
                  {fnsFormat(w.weekStart, 'MMM dd')} – {fnsFormat(w.weekEnd, 'MMM dd yyyy')}
                </h2>
                <IonCardHeader className={styles.header}>
                  <IonCardSubtitle className={styles.subtitle}>
                    <label>Tracked: </label>
                    {formatTime(w.milliseconds)}
                  </IonCardSubtitle>
                  <IonCardTitle>
                    <label>Billable: </label>
                    {formatCurrency(w.billable, settings.currency.currency)}
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

export default WeekHistoryModal;
