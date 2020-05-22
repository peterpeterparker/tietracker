import React, {createRef, CSSProperties, RefObject, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonList, IonSearchbar, IonTitle, IonToolbar, IonLabel} from '@ionic/react';

import {useTranslation} from 'react-i18next';

import {close} from 'ionicons/icons';

import styles from './ClientsModal.module.scss';

import {rootConnector, RootProps} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import {Client} from '../../models/client';

interface Props extends RootProps {
  presented: boolean;
}

const ClientsModal: React.FC<Props> = (props) => {
  const {t} = useTranslation('clients');

  const headerRef: RefObject<HTMLIonHeaderElement> = React.createRef();

  const filterRef: RefObject<any> = createRef();

  const clients: Client[] | undefined = useSelector((state: RootState) => state.clients.clients);

  const [filteredClients, setFilteredClients] = useState<Client[] | undefined>(undefined);

  useEffect(() => {
    setFilteredClients(clients === undefined ? [] : clients);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients]);

  useEffect(() => {
    if (props.presented) {
      focusFilter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.presented]);

  async function focusFilter() {
    await filterRef.current.setFocus();
  }

  async function onFilter($event: CustomEvent<KeyboardEvent>) {
    if (!$event) {
      return;
    }

    const input: string = ($event.target as InputTargetEvent).value;

    if (!input || input === undefined || input === '') {
      setFilteredClients(clients);
    } else {
      const clients: Client[] = await filterClients(input);
      setFilteredClients(clients);
    }
  }

  function filterClients(filter: string): Promise<Client[]> {
    return new Promise<Client[]>((resolve) => {
      if (!clients || clients.length <= 0) {
        resolve([]);
        return;
      }

      const results: Client[] = clients.filter((client: Client) => {
        return client.data.name && client.data.name.toLowerCase().indexOf(filter.toLowerCase()) > -1;
      });

      resolve(results);
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
          ref={filterRef}
          onIonInput={($event: CustomEvent<KeyboardEvent>) => onFilter($event)}></IonSearchbar>

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
        <IonItem key={client.id} className={styles.item} lines="none" detail={false} onClick={() => closeModal(client.id)}>
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
