import React from 'react';

import {IonContent, IonHeader, IonPage, IonToolbar} from '@ionic/react';

import {useTranslation} from 'react-i18next';

import {rootConnector} from '../../store/thunks/index.thunks';

import Header from '../../components/header/Header';
import WeekCharts from '../../components/charts/week/WeekCharts';

const Statistics: React.FC = () => {

    const {t} = useTranslation('statistics');

    return (
        <IonPage>
            <IonContent>
                <Header></Header>

                <main className="ion-padding">
                    <IonHeader>
                        <IonToolbar className="title">
                            <h1>{t('title')}</h1>
                        </IonToolbar>
                    </IonHeader>

                    <WeekCharts></WeekCharts>
                </main>
            </IonContent>
        </IonPage>
    );
};

export default rootConnector(Statistics);
