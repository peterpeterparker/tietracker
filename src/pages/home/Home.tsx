import React, {useState} from 'react';
import {RouteComponentProps} from 'react-router';

import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonButton,
  IonModal,
  IonLabel,
  useIonViewDidEnter,
  useIonViewDidLeave,
  IonIcon
} from '@ionic/react';

import {search} from 'ionicons/icons';

import { useTranslation } from 'react-i18next';

import styles from './Home.module.scss';

import CreateClientModal from '../../modals/client/CreateClientModal';
import ClientsModal from '../../modals/clients/ClientsModal';

import Projects from '../../components/projects/Projects';
import Summary from '../../components/summary/Summary';
import Tasks from '../../components/tasks/Tasks';
import Header from '../../components/header/Header';

const Home: React.FC<RouteComponentProps> = (props) => {

  const { t } = useTranslation('home');

  const [showModalClient, setShowModalClient] = useState(false);
  const [showModalClients, setShowModalClients] = useState(false);

  const [modalPresented,setModalPresented] = useState(false);

  async function closeAndNavigate($event: CustomEvent) {
    await setShowModalClients(false);
    await setModalPresented(false);

    if ($event && $event.detail && $event.detail.data) {
      props.history.push(`/client/${$event.detail.data}`);
    }
  }

  async function closeClientModal() {
    await setShowModalClient(false);
    await setModalPresented(false);
  }

  useIonViewDidEnter(() => {
    document.addEventListener('ionModalDidPresent', () => setModalPresented(true), false);
  });

  useIonViewDidLeave(() => {
    document.removeEventListener('ionModalDidPresent', () => setModalPresented(true), true);
  });

  return (
    <IonPage>
      <IonContent>

        <Header></Header>

        <IonModal isOpen={showModalClient} onDidDismiss={async () => await closeClientModal()} cssClass="fullscreen">
          <CreateClientModal closeAction={async () => await closeClientModal()}></CreateClientModal>
        </IonModal>

        <IonModal isOpen={showModalClients} onDidDismiss={($event) => closeAndNavigate($event)} cssClass="fullscreen">
          <ClientsModal presented={modalPresented}></ClientsModal>
        </IonModal>

        <main className="ion-padding-start ion-padding-bottom ion-padding-top">
          <IonHeader className="ion-padding-end">
            <IonToolbar className={styles.toolbar}>
              <button aria-label={t('search.clients')} className={styles.searchbar} onClick={() => setShowModalClients(true)}>
                <IonIcon icon={search} />
                <IonLabel>{t('search.clients')}</IonLabel>
              </button>
            </IonToolbar>
          </IonHeader>

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
