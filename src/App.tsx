import {SplashScreen} from '@capacitor/splash-screen';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonLoading,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
import {createTheme, ThemeProvider} from '@mui/material';
import {card, ellipsisHorizontal} from 'ionicons/icons';
import React, {useEffect, useState} from 'react';
import {Translation, useTranslation} from 'react-i18next';
import {Redirect, Route} from 'react-router-dom';
import BackupAlert from './alerts/backup/BackupAlert';
import {ErrorToast} from './alerts/error/ErrorToast';
import './lib/helpers/i18n';
import {MigrateService} from './lib/services/migrate.service';
import {rootConnector, RootProps} from './lib/store/thunks/index.thunks';
import {testIds} from './lib/tests/test-ids.constants';
import {testId} from './lib/tests/test.utils';
import {emitError} from './lib/utils/utils.events';
import {initAllData} from './lib/utils/utils.store';
import TrackTaskModal from './modals/task/track/TrackTaskModal';
import About from './pages/about/About';
import Backup from './pages/backup/Backup';
import ClientDetails from './pages/details/client/ClientDetails';
import TaskDetails from './pages/details/task/TaskDetails';
import Home from './pages/home/Home';
import Invoices from './pages/invoices/Invoices';
import {More} from './pages/more/More';
import Period from './pages/period/Period';
import Privacy from './pages/privacy/Privacy';
import Settings from './pages/settings/Settings';
import Terms from './pages/terms/Terms';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/display.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';

/* Theme variables */
import './theme/alert.scss';
import './theme/button.scss';
import './theme/card.scss';
import './theme/checkbox-toggle.scss';
import './theme/content.scss';
import './theme/datetime.picker.scss';
import './theme/fonts.scss';
import './theme/header.scss';
import './theme/input.scss';
import './theme/link.scss';
import './theme/loading.scss';
import './theme/modal.scss';
import './theme/reorder.scss';
import './theme/searchbar.scss';
import './theme/segment.scss';
import './theme/spinner.scss';
import './theme/tabs.scss';
import './theme/toolbar.scss';
import './theme/variables.scss';

const theme = createTheme({
  typography: {
    fontFamily: "'Open Sans', sans-serif",
  },
});

const App: React.FC<RootProps> = (props: RootProps) => {
  const [selectedTab, setSelectedTab] = useState<string>('home');
  const [backup, setBackup] = useState<boolean>(false);

  // TODO: to be removed
  const [migrating, setMigrating] = useState<boolean>(false);

  const {t} = useTranslation(['common']);

  async function init() {
    // Init theme first
    await props.initTheme();

    await SplashScreen.hide();

    await migrateIdbToFilesystem();

    await initAllData(props);
  }

  useEffect(() => {
    (async () => {
      await init();

      initSelectedTab();

      setBackup(true);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initSelectedTab() {
    const element: HTMLElement | null = document.querySelector('ion-tab-bar');

    if (element) {
      const selected: string = (element as any).selectedTab;
      setSelectedTab(selected ? selected : 'home');
    }
  }

  const migrateIdbToFilesystem = async () => {
    const result = await new MigrateService().migrateIdbToFilesystem({
      onMigrate: (status) => {
        setMigrating(status === 'start');
      },
    });

    if (result.status === 'success') {
      return;
    }

    emitError(result.err);
  };

  return (
    <ThemeProvider theme={theme}>
      <IonApp>
        <IonReactRouter>
          <IonTabs onIonTabsDidChange={($event) => setSelectedTab($event.detail.tab)}>
            <IonRouterOutlet>
              <Route path="/home" component={Home} />
              <Route path="/invoices" component={Invoices} exact={true} />
              <Route path="/more" component={More} exact={true} />

              <Route path="/settings" component={Settings} exact={true} />
              <Route path="/backup" component={Backup} exact={true} />
              <Route path="/about" component={About} exact={true} />
              <Route path="/period" component={Period} exact={true} />

              <Route path="/terms" component={Terms} exact={true} />
              <Route path="/privacy" component={Privacy} exact={true} />

              <Route path="/client/:id" component={ClientDetails} />
              <Route path="/task/:day/:id" component={TaskDetails} />

              <Route path="/" render={() => <Redirect to="/home" />} exact={true} />
            </IonRouterOutlet>

            <IonTabBar slot="bottom">
              <IonTabButton tab="home" href="/home" {...testId(testIds.nav.home)}>
                {selectedTab === 'home' ? (
                  <IonIcon src="/assets/icon/logo.svg" aria-label="Tie Tracker logo" />
                ) : (
                  <IonIcon src="/assets/icon/logo-grey.svg" aria-label="Tie Tracker logo" />
                )}
                <Translation ns="common">
                  {(t, {i18n}) => <IonLabel>{t('navigation.home')}</IonLabel>}
                </Translation>
              </IonTabButton>
              <IonTabButton tab="invoices" href="/invoices" {...testId(testIds.nav.invoices)}>
                <IonIcon icon={card} />
                <Translation ns="common">
                  {(t, {i18n}) => <IonLabel>{t('navigation.invoices')}</IonLabel>}
                </Translation>
              </IonTabButton>
              <IonTabButton tab="more" href="/more" {...testId(testIds.nav.more)}>
                <IonIcon icon={ellipsisHorizontal} />
                <Translation ns="common">
                  {(t, {i18n}) => <IonLabel>{t('navigation.more')}</IonLabel>}
                </Translation>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>

        <TrackTaskModal></TrackTaskModal>

        {backup ? <BackupAlert></BackupAlert> : undefined}

        <IonLoading isOpen={migrating} message={t('common:actions.preparing')} />

        <ErrorToast />
      </IonApp>
    </ThemeProvider>
  );
};

export default rootConnector(App);
