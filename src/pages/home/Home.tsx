import React, { useState } from 'react';
import {RouteComponentProps} from 'react-router';

import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonSearchbar,
  IonButton,
  IonModal
} from '@ionic/react';

import { useTranslation } from 'react-i18next';

import styles from './Home.module.scss';

import ClientModal from '../../modals/client/ClientModal';
import ClientsModal from '../../modals/clients/ClientsModal';

import Projects from '../../components/projects/Projects';
import Summary from '../../components/summary/Summary';
import Tasks from '../../components/tasks/Tasks';
import Header from '../../components/header/Header';

const Home: React.FC<RouteComponentProps> = (props) => {

  const { t } = useTranslation('home');

  const [showModalClient, setShowModalClient] = useState(false);
  const [showModalClients, setShowModalClients] = useState(false);

  async function closeAndNavigate($event: CustomEvent) {
    await setShowModalClients(false);

    if ($event && $event.detail && $event.detail.data) {
      props.history.push(`/client/${$event.detail.data}`);
    }
  }

  return (
    <IonPage>
      <Header></Header>

      <IonContent className="ion-padding-start ion-padding-bottom ion-padding-top">

        <IonModal isOpen={showModalClient} onDidDismiss={() => setShowModalClient(false)} cssClass="fullscreen">
          <ClientModal closeAction={async () => await setShowModalClient(false)}></ClientModal>
        </IonModal>

        <IonModal isOpen={showModalClients} onDidDismiss={($event) => closeAndNavigate($event)} cssClass="fullscreen">
          <ClientsModal isOpen={showModalClients}></ClientsModal>
        </IonModal>

        <main>
          <IonHeader className="ion-padding-end"><IonToolbar><IonSearchbar placeholder={t('search.clients')} className={styles.searchbar} onIonFocus={() => setShowModalClients(true)}></IonSearchbar></IonToolbar></IonHeader>

          <div className={styles.addclient}>
            <IonButton onClick={() => setShowModalClient(true)} fill="outline" color="medium" size="small">Add a new client</IonButton>
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
