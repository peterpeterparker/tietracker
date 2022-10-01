import {useTranslation} from 'react-i18next';

import {useHistory} from 'react-router';

import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonToolbar,
} from '@ionic/react';
import {calendarNumber, information, logoGithub, options, server, statsChart} from 'ionicons/icons';

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

          <IonList>
            <IonItem
              detail={true}
              button={true}
              onClick={() => navigate('/statistics')}
              className={styles.item}
            >
              <IonIcon slot="start" icon={statsChart} className={styles.icon} />
              <IonLabel>{t('common:navigation.statistics')}</IonLabel>
            </IonItem>
            <IonItem
              detail={true}
              button={true}
              onClick={() => navigate('/settings')}
              className={styles.item}
            >
              <IonIcon slot="start" icon={options} className={styles.icon} />
              <IonLabel>{t('common:navigation.settings')}</IonLabel>
            </IonItem>
            <IonItem
              detail={true}
              button={true}
              onClick={() => navigate('/backup')}
              className={styles.item}
            >
              <IonIcon slot="start" icon={server} className={styles.icon} />
              <IonLabel>{t('common:navigation.backup')}</IonLabel>
            </IonItem>
            <IonItem
              detail={true}
              button={true}
              onClick={() => navigate('/period')}
              className={styles.item}
            >
              <IonIcon slot="start" icon={calendarNumber} className={styles.icon} />
              <IonLabel>{t('common:navigation.period')}</IonLabel>
            </IonItem>
            <IonItem
              detail={true}
              button={true}
              onClick={() => navigate('/about')}
              className={styles.item}
            >
              <IonIcon slot="start" icon={information} className={styles.icon} />
              <IonLabel>{t('common:navigation.about')}</IonLabel>
            </IonItem>
            <IonItem
              detail={true}
              button={true}
              href="https://github.com/peterpeterparker/tietracker"
              target="_blank"
              className={styles.item}
            >
              <IonIcon slot="start" icon={logoGithub} className={styles.icon} />
              <IonLabel>GitHub</IonLabel>
            </IonItem>
          </IonList>
        </main>
      </IonContent>
    </IonPage>
  );
};
