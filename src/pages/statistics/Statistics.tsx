import React, {useState} from 'react';

import {IonContent, IonHeader, IonPage, IonToolbar, useIonViewDidLeave, useIonViewWillEnter} from '@ionic/react';

import {rootConnector} from '../../store/thunks/index.thunks';

import Header from '../../components/header/Header';
import WeekCharts from '../../components/charts/week/WeekCharts';
import Summary from '../../components/summary/Summary';

const Statistics: React.FC = () => {
  const [entered, setEntered] = useState<boolean>(false);

  useIonViewWillEnter(() => {
    setEntered(true);
  });

  useIonViewDidLeave(() => {
    setEntered(false);
  });

  return (
    <IonPage>
      <IonContent>
        <Header></Header>

        <main className="ion-padding">
          <Summary extended={true}></Summary>

          {entered ? <WeekCharts></WeekCharts> : undefined}
        </main>
      </IonContent>
    </IonPage>
  );
};

export default rootConnector(Statistics);
