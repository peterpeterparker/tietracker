import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonModal} from '@ionic/react';

import {useTranslation} from 'react-i18next';

import styles from './Summary.module.scss';

import {RootState} from '../../store/reducers';
import {rootConnector, RootProps} from '../../store/thunks/index.thunks';

import {Invoice} from '../../store/interfaces/invoice';
import {Summary as SummaryData} from '../../store/interfaces/summary';

import {formatCurrency} from '../../utils/utils.currency';
import {formatTime} from '../../utils/utils.time';

import {Settings} from '../../models/settings';

import HistoryModal, {HistoryType} from '../../modals/history/HistoryModal.tsx';

interface Props extends RootProps {
  extended: boolean;
}

interface OpenBillable {
  billable: number;
  hours: number;
}

const Summary: React.FC<Props> = (props: Props) => {
  const {t} = useTranslation('summary');

  const summary: SummaryData | undefined = useSelector((state: RootState) => state.summary.summary);
  const invoices: Invoice[] = useSelector((state: RootState) => state.invoices.invoices);
  const settings: Settings = useSelector((state: RootState) => state.settings.settings);

  const [open, setOpen] = useState<OpenBillable>({
    billable: 0,
    hours: 0,
  });

  const [showHistory, setShowHistory] = useState<HistoryType | undefined>(undefined);

  useEffect(() => {
    if (invoices && invoices.length > 0) {
      const openSum: OpenBillable = invoices.reduce(
        (acc: OpenBillable, value: Invoice) => {
          return {
            billable: acc.billable + value.billable,
            hours: acc.hours + value.hours,
          };
        },
        {...open},
      );

      setOpen(openSum);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices]);

  return (
    <div className="ion-padding-end">
      <IonModal
        isOpen={showHistory !== undefined}
        onDidDismiss={() => setShowHistory(undefined)}
        className="fullscreen">
        {showHistory !== undefined && (
          <HistoryModal type={showHistory} closeAction={() => setShowHistory(undefined)} />
        )}
      </IonModal>

      <h1 className={`${styles.title} ${props.extended ? 'extended' : ''}`}>{t('title')}</h1>

      <div className={`${styles.summary} ${props.extended ? 'extended' : ''}`}>
        <IonCard
          className={`${styles.card} ${styles.clickable}`}
          color="card"
          button
          onClick={() => setShowHistory('daily')}>
          <h2 className={styles.title}>{t('today')}</h2>
          <IonCardHeader className={styles.header}>
            <IonCardSubtitle className={styles.subtitle}>
              <label>{t('tracked')} </label>
              {formatTime(summary !== undefined ? summary.total.today.milliseconds : undefined)}
            </IonCardSubtitle>
            <IonCardTitle>
              <label>{t('billable')} </label>
              {formatCurrency(
                summary !== undefined ? summary.total.today.billable : undefined,
                settings.currency.currency,
              )}
            </IonCardTitle>
          </IonCardHeader>
        </IonCard>

        <IonCard
          className={`${styles.card} ${styles.clickable}`}
          color="card"
          button
          onClick={() => setShowHistory('weekly')}>
          <h2 className={styles.title}>{t('week')}</h2>
          <IonCardHeader className={styles.header}>
            <IonCardSubtitle className={styles.subtitle}>
              <label>{t('tracked')} </label>
              {formatTime(summary !== undefined ? summary.total.week.milliseconds : undefined)}
            </IonCardSubtitle>
            <IonCardTitle>
              <label>{t('billable')} </label>
              {formatCurrency(
                summary !== undefined ? summary.total.week.billable : undefined,
                settings.currency.currency,
              )}
            </IonCardTitle>
          </IonCardHeader>
        </IonCard>

        {renderOverallOpen()}
      </div>
    </div>
  );

  function renderOverallOpen() {
    if (!props.extended) {
      return undefined;
    }

    return (
      <IonCard className={styles.card} color="card">
        <h2 className={styles.title}>{t('total')}</h2>
        <IonCardHeader className={styles.header}>
          <IonCardSubtitle className={styles.subtitle}>
            <label>{t('tracked')} </label>
            {formatTime(open !== undefined ? open.hours * 3600 * 1000 : undefined)}
          </IonCardSubtitle>
          <IonCardTitle>
            <label>{t('billable')} </label>
            {formatCurrency(
              open !== undefined ? open.billable : undefined,
              settings.currency.currency,
            )}
          </IonCardTitle>
        </IonCardHeader>
      </IonCard>
    );
  }
};

export default rootConnector(Summary);