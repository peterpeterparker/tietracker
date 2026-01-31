import {CSSProperties, RefObject, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import type {IonSearchbarCustomEvent} from '@ionic/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  SearchbarInputEventDetail,
} from '@ionic/react';

import {useTranslation} from 'react-i18next';

import {close} from 'ionicons/icons';

import styles from './ClientsModal.module.scss';

import {RootState} from '../../store/reducers';
import {rootConnector} from '../../store/thunks/index.thunks';

import {Client} from '../../models/client';

const ClientsModal = () => {
  const {t} = useTranslation('clients');

  const headerRef: RefObject<HTMLIonHeaderElement | null> = useRef(null);

  const clients: Client[] | undefined = useSelector((state: RootState) => state.clients.clients);

  const [filteredClients, setFilteredClients] = useState<Client[] | undefined>(undefined);

  useEffect(() => {
    setFilteredClients(clients === undefined ? [] : clients);
  }, [clients]);

  function onFilter($event: IonSearchbarCustomEvent<SearchbarInputEventDetail>) {
    if (!$event) {
      return;
    }

    const input: string = ($event.target as InputTargetEvent).value;

    if (!input || input === undefined || input === '') {
      setFilteredClients(clients);
    } else {
      const clients: Client[] = filterClients(input);
      setFilteredClients(clients);
    }
  }

  function filterClients(filter: string): Client[] {
    if (!clients || clients.length <= 0) {
      return [];
    }

    return clients.filter((client: Client) => {
      return client.data.name && client.data.name.toLowerCase().indexOf(filter.toLowerCase()) > -1;
    });
  }

  async function closeModal(clientId?: string) {
    if (!headerRef || !headerRef.current) {
      return;
    }

    await (headerRef.current.closest('ion-modal') as HTMLIonModalElement).dismiss(clientId);
  }

  return (
    <IonContent>
      <IonHeader ref={headerRef}>
        <IonToolbar>
          <IonTitle>{t('search.title')}</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={() => closeModal()}>
              <IonIcon icon={close} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <main className="ion-padding">
        <IonSearchbar
          debounce={500}
          placeholder={t('search.filter')}
          className={styles.searchbar}
          onIonInput={onFilter}></IonSearchbar>

        <IonList className="ion-margin-top">{renderClients()}</IonList>
      </main>
    </IonContent>
  );

  function renderClients() {
    if (!filteredClients || filteredClients.length <= 0) {
      return (
        <IonItem className={styles.item + ' ' + styles.label} lines="none" detail={false}>
          <IonLabel className="placeholder">{t('search.empty')}</IonLabel>
        </IonItem>
      );
    }

    return filteredClients.map((client: Client) => {
      return (
        <IonItem
          key={client.id}
          className={styles.item}
          lines="none"
          detail={false}
          onClick={() => closeModal(client.id)}>
          <div slot="start" style={{background: client.data.color} as CSSProperties}></div>

          <IonLabel>
            <h2>{client.data.name}</h2>
          </IonLabel>
        </IonItem>
      );
    });
  }
};

export default rootConnector(ClientsModal);
