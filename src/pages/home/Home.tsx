import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonSearchbar,
  IonButton,
  IonModal
} from '@ionic/react';

import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import styles from './Home.module.scss';

import ClientModal from '../../modals/client/ClientModal';
import ClientsModal from '../../modals/clients/ClientsModal';

import Projects from '../../components/projects/Projects';
import Summary from '../../components/summary/Summary';
import Tasks from '../../components/tasks/Tasks';
import Header from '../../components/header/Header';

const Home: React.FC = () => {

  const { t } = useTranslation('home');

  const [showModalClient, setShowModalClient] = useState(false);
  const [showModalClients, setShowModalClients] = useState(false);

  return (
    <IonPage>
      <Header></Header>

      <IonContent className="ion-padding-start ion-padding-bottom ion-padding-top">

        <IonModal isOpen={showModalClient} onDidDismiss={() => setShowModalClient(false)} cssClass="fullscreen">
          <ClientModal closeAction={async () => await setShowModalClient(false)}></ClientModal>
        </IonModal>

        <IonModal isOpen={showModalClients} onDidDismiss={() => setShowModalClients(false)} cssClass="fullscreen">
          <ClientsModal isOpen={showModalClients} closeAction={async () => await setShowModalClients(false)}></ClientsModal>
        </IonModal>

        <main>
          <IonHeader className="ion-padding-end"><IonToolbar><IonSearchbar placeholder={t('search.clients')} className={styles.searchbar} onIonFocus={() => setShowModalClients(true)}></IonSearchbar></IonToolbar></IonHeader>

          <div className={styles.addclient}>
            <IonButton onClick={() => setShowModalClient(true)} fill="outline" color="medium">Add a new client</IonButton>
          </div>

          <Summary></Summary>

          <Projects addAction={() => setShowModalClient(true)}></Projects>

          <Tasks></Tasks>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Home;
