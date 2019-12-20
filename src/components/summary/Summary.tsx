import React from 'react';
import {useSelector} from 'react-redux';

import {IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle} from '@ionic/react';

import styles from './Summary.module.scss';

import {rootConnector} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import {Summary as SummaryData} from '../../store/interfaces/summary';

const Summary: React.FC = () => {

    const summary: SummaryData | undefined = useSelector((state: RootState) => state.summary.summary);

    return (<div className="ion-padding-end ion-padding-top">
        <h1 className={styles.title}>Weekly Summary</h1>
        <IonCard className={styles.card}>
            <IonCardHeader>
                <IonCardSubtitle>Hours tracked: {summary !== undefined ? summary.hours : 0.0}</IonCardSubtitle>
                <IonCardTitle>Billable amount: {summary !== undefined ? summary.billable : 0.0} CHF</IonCardTitle>
            </IonCardHeader>
        </IonCard>
    </div>);
};

export default rootConnector(Summary);
