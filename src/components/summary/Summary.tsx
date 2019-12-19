import React from 'react';
import { useSelector } from 'react-redux';

import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent } from '@ionic/react';

import styles from './Summary.module.scss';

import { rootConnector, RootProps } from '../../store/thunks/index.thunks';
import { RootState } from '../../store/reducers';

import { Summary as SummaryData } from '../../services/summary/summary.service';

const Summary: React.FC<RootProps> = (props: RootProps) => {

    const summary: SummaryData | undefined = useSelector((state: RootState) => state.summary.summary);

    return (<IonCard>
        <IonCardHeader>
            <IonCardSubtitle>Hours tracked: {summary !== undefined ? summary.hours : 0.0}</IonCardSubtitle>
            <IonCardTitle>Billable amount: {summary !== undefined ? summary.billable : 0.0} CHF</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
            <p>Top projects:</p>
        </IonCardContent>
    </IonCard>
    );
}

export default rootConnector(Summary);