import React from 'react';
import {useSelector} from 'react-redux';

import {IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle} from '@ionic/react';

import {useTranslation} from 'react-i18next';

import styles from './Summary.module.scss';

import {rootConnector} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import {Summary as SummaryData} from '../../store/interfaces/summary';

import {formatCurrency} from '../../utils/utils.currency';
import {formatTime} from '../../utils/utils.time';

import {Settings} from '../../models/settings';

const Summary: React.FC = () => {

    const {t} = useTranslation('summary');

    const summary: SummaryData | undefined = useSelector((state: RootState) => state.summary.summary);
    const settings: Settings = useSelector((state: RootState) => state.settings.settings);

    return (<>
        <div className={styles.summary}>
            <IonCard className={styles.card} color="card">
                <h2 className={styles.title}>{t('today')}</h2>
                <IonCardHeader className={styles.header}>
                    <IonCardSubtitle className={styles.subtitle}><label>{t('tracked')} </label>{formatTime(summary !== undefined ? summary.total.today.milliseconds : undefined)}</IonCardSubtitle>
                    <IonCardTitle><label>{t('billable')} </label>{formatCurrency(summary !== undefined ? summary.total.today.billable : undefined, settings.currency.currency)}</IonCardTitle>
                </IonCardHeader>
            </IonCard>

            <IonCard className={styles.card} color="card">
                <h2 className={styles.title}>{t('week')}</h2>
                <IonCardHeader className={styles.header}>
                    <IonCardSubtitle className={styles.subtitle}><label>{t('tracked')} </label>{formatTime(summary !== undefined ? summary.total.week.milliseconds : undefined)}</IonCardSubtitle>
                    <IonCardTitle><label>{t('billable')} </label>{formatCurrency(summary !== undefined ? summary.total.week.billable : undefined, settings.currency.currency)}</IonCardTitle>
                </IonCardHeader>
            </IonCard>
        </div>
    </>);
};

export default rootConnector(Summary);
