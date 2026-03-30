import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import {close} from 'ionicons/icons';
import {
  eachDayOfInterval,
  endOfWeek,
  format as fnsFormat,
  startOfWeek,
  subDays,
  subWeeks,
} from 'date-fns';
import {useTranslation} from 'react-i18next';

import styles from './HistoryModal.module.scss';

import {RootState} from '../../store/reducers';
import {Settings} from '../../models/settings';
import {SummaryDay} from '../../store/interfaces/summary';
import {formatCurrency} from '../../utils/utils.currency';
import {formatTime} from '../../utils/utils.time';
import {SummaryService} from '../../services/summary/summary.service';

import Loading from '../../components/loading/Loading';

export type HistoryType = 'daily' | 'weekly';

interface DayResult {
  label: string;
  milliseconds: number;
  billable: number;
}

interface Props {
  type: HistoryType;
  closeAction: () => void;
}

const HistoryModal: React.FC<Props> = ({type, closeAction}) => {
  const {t} = useTranslation('summary');

  const settings: Settings = useSelector((state: RootState) => state.settings.settings);

  const [results, setResults] = useState<DayResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    if (type === 'daily') {
      const pastDays = buildPastDays();
      SummaryService.getInstance().compute(
        (data: {days: SummaryDay[]}) => {
          setResults(mapDays(data.days, pastDays));
          setLoading(false);
        },
        pastDays,
      );
    } else {
      const weekRanges = buildWeekRanges();
      const allDays = weekRanges.flatMap(({weekStart, weekEnd}) =>
        eachDayOfInterval({start: weekStart, end: weekEnd}),
      );
      SummaryService.getInstance().compute(
        (data: {days: SummaryDay[]}) => {
          setResults(mapWeeks(data.days, weekRanges));
          setLoading(false);
        },
        allDays,
      );
    }
  }, [type]);

  function buildPastDays(): Date[] {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return eachDayOfInterval({start: startOfMonth, end: subDays(today, 1)}).reverse();
  }

  function buildWeekRanges(): {weekStart: Date; weekEnd: Date}[] {
    const now = new Date();
    return Array.from({length: 12}, (_, i) => {
      const ref = subWeeks(now, i + 1);
      return {
        weekStart: startOfWeek(ref, {weekStartsOn: 1}),
        weekEnd: endOfWeek(ref, {weekStartsOn: 1}),
      };
    });
  }

  function mapDays(days: SummaryDay[], pastDays: Date[]): DayResult[] {
    return days.map((d, i) => ({
      label: fnsFormat(pastDays[i], 'EEEE, MMM dd yyyy'),
      milliseconds: d.milliseconds,
      billable: d.billable,
    }));
  }

  function mapWeeks(
    days: SummaryDay[],
    weekRanges: {weekStart: Date; weekEnd: Date}[],
  ): DayResult[] {
    return weekRanges.map(({weekStart, weekEnd}, wi) => {
      const slice = days.slice(wi * 7, wi * 7 + 7);
      return {
        label: `${fnsFormat(weekStart, 'MMM dd')} – ${fnsFormat(weekEnd, 'MMM dd yyyy')}`,
        milliseconds: slice.reduce((sum, d) => sum + d.milliseconds, 0),
        billable: slice.reduce((sum, d) => sum + d.billable, 0),
      };
    });
  }

  return (
    <IonContent>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={closeAction}>
              <IonIcon icon={close} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle>{t(`history.${type}.title`)}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <main className="ion-padding">
        {loading ? (
          <Loading />
        ) : (
          <IonGrid>
            <IonRow>
              {results.map((r, i) => (
                <IonCol key={i} size="6" sizeMd="4" sizeLg="3">
                  <IonCard className={styles.card} color="card">
                    <h2 className={styles.cardTitle}>{r.label}</h2>
                    <IonCardHeader className={styles.header}>
                      <IonCardSubtitle className={styles.subtitle}>
                        <label>{t('tracked')} </label>
                        {formatTime(r.milliseconds)}
                      </IonCardSubtitle>
                      <IonCardTitle>
                        <label>{t('billable')} </label>
                        {formatCurrency(r.billable, settings.currency.currency)}
                      </IonCardTitle>
                    </IonCardHeader>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}
      </main>
    </IonContent>
  );
};

export default HistoryModal;