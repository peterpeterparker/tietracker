import React from 'react';

import {useTranslation} from 'react-i18next';

import {useHistory} from 'react-router';

import {IonContent, IonPage, IonHeader, IonToolbar, IonList, IonItem, IonLabel, IonIcon} from '@ionic/react';
import {information, options, statsChart} from 'ionicons/icons';

import styles from './More.module.scss';

export const More = () => {
  const {t} = useTranslation(['common', 'more']);

  const history = useHistory();

  const navigate = (route: string) => history.push(route);

  return (
    <IonPage>
      <IonContent>
        <main className="ion-padding">
          <IonHeader>
            <IonToolbar className="title">
              <h1>{t('more:title')}</h1>
            </IonToolbar>
          </IonHeader>

          <IonList className="ion-margin-top">
            <IonItem detail={true} button={true} onClick={() => navigate('/statistics')} className={styles.item}>
              <IonIcon slot="start" icon={statsChart} />
              <IonLabel>{t('common:navigation.statistics')}</IonLabel>
            </IonItem>
            <IonItem detail={true} button={true} onClick={() => navigate('/settings')} className={styles.item}>
              <IonIcon slot="start" icon={options} />
              <IonLabel>{t('common:navigation.settings')}</IonLabel>
            </IonItem>
            <IonItem detail={true} button={true} onClick={() => navigate('/about')} className={styles.item}>
              <IonIcon slot="start" icon={information} />
              <IonLabel>{t('common:navigation.about')}</IonLabel>
            </IonItem>
          </IonList>
        </main>
      </IonContent>
    </IonPage>
  );
};
