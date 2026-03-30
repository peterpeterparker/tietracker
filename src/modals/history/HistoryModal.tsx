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
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {close} from 'ionicons/icons';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {SummaryService} from '../../services/summary/summary.service';
import {Summary} from '../../store/interfaces/summary';
import {RootState} from '../../store/reducers';
import {formatCurrency} from '../../utils/utils.currency';
import {buildPastDays, buildWeek, DayResult, mapDays} from '../../utils/utils.history';
import {formatTime} from '../../utils/utils.time';
import styles from './HistoryModal.module.scss';

type HistoryType = 'daily' | 'weekly';

interface Props {
  type: HistoryType;
  closeAction: () => void;
}

const HistoryModal: React.FC<Props> = ({type, closeAction}) => {
  const {t} = useTranslation('summary');

  const settings = useSelector((state: RootState) => state.settings.settings);

  const [results, setResults] = useState<DayResult[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    const daysRangeFn = type === 'daily' ? buildPastDays : buildWeek;
    const pastDays = daysRangeFn();

    const updateFn = (data: Summary) => {
      setResults(mapDays({days: data.days, pastDays}));
    };

    await SummaryService.getInstance().compute({updateFn, days: pastDays});
  };

  useEffect(() => {
    setLoading(true);

    (async () => {
      await loadHistory();

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

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

      <main className="ion-padding">{renderHistory()}</main>
    </IonContent>
  );

  function renderHistory() {
    if (loading) {
      return (
        <div className="spinner">
          <IonSpinner color="primary"></IonSpinner>
        </div>
      );
    }

    return (
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
    );
  }
};

export default HistoryModal;
