import React, {useState} from 'react';
import {useSelector} from 'react-redux';

import {RouteComponentProps} from 'react-router';

import {IonContent, IonHeader, IonPage, IonToolbar, IonButton, IonModal, IonLabel, useIonViewDidEnter, useIonViewDidLeave, IonIcon} from '@ionic/react';

import {search} from 'ionicons/icons';

import {useTranslation} from 'react-i18next';

import styles from './Home.module.scss';

import CreateClientModal from '../../modals/client/CreateClientModal';
import ClientsModal from '../../modals/clients/ClientsModal';
import CreateTaskModal from '../../modals/task/create/CreateTaskModal';

import Projects from '../../components/projects/Projects';
import Summary from '../../components/summary/Summary';
import Tasks from '../../components/tasks/Tasks';
import Header from '../../components/header/Header';

import {Client} from '../../models/client';

import {RootState} from '../../store/reducers';

const Home: React.FC<RouteComponentProps> = (props) => {
  const {t} = useTranslation('home');

  const clients: Client[] | undefined = useSelector((state: RootState) => state.clients.clients);

  const [showModalClient, setShowModalClient] = useState(false);
  const [showModalClients, setShowModalClients] = useState(false);
  const [showModalTask, setShowModalTask] = useState(false);

  const [modalPresented, setModalPresented] = useState(false);

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
    document.addEventListener('ionModalDidPresent', updatePresented, {passive: true});
  });

  useIonViewDidLeave(() => {
    document.removeEventListener('ionModalDidPresent', updatePresented, false);
  });

  const updatePresented = () => {
    setModalPresented(true);
  };

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

        <IonModal isOpen={showModalTask} onDidDismiss={() => setShowModalTask(false)} cssClass="fullscreen">
          <CreateTaskModal closeAction={() => setShowModalTask(false)}></CreateTaskModal>
        </IonModal>

        <main className="ion-padding-start ion-padding-bottom ion-padding-top">
          <IonHeader className="ion-padding-end">
            <IonToolbar className={styles.toolbar}>
              <button aria-label={t('search.clients')} className={styles.searchbar + ' input'} onClick={() => setShowModalClients(true)}>
                <IonIcon icon={search} />
                <IonLabel>{t('search.clients')}</IonLabel>
              </button>
            </IonToolbar>
          </IonHeader>

          <div className={styles.addclient}>{renderClientsAction()}</div>

          <Summary extended={false}></Summary>

          <Projects addAction={() => setShowModalClient(true)}></Projects>

          <Tasks addAction={() => setShowModalTask(true)}></Tasks>
        </main>
      </IonContent>
    </IonPage>
  );

  function renderClientsAction() {
    const loading: boolean = clients === undefined;
    const empty: boolean = !loading && clients !== undefined && clients.length <= 0;

    return (
      <IonButton
        onClick={() => setShowModalClient(true)}
        className={empty ? styles.start : undefined}
        fill="outline"
        color="medium"
        size="small"
        style={loading ? {visibility: 'hidden', opacity: 0} : undefined}
        aria-label={t('add.client')}>
        {empty ? t('add.start') : t('add.client')}
      </IonButton>
    );
  }
};

export default Home;
