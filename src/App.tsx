import React, {Suspense, useEffect, useState} from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { options, card, information } from 'ionicons/icons';

import Home from './pages/home/Home';
import Settings from './pages/settings/Settings';
import Invoices from './pages/invoices/Invoices';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.scss';

import './theme/content.scss';
import './theme/header.scss';
import './theme/input.scss';
import './theme/button.scss';
import './theme/modal.scss';
import './theme/fonts.scss';
import './theme/card.scss';
import './theme/datetime.picker.scss';
import './theme/spinner.scss';
import './theme/checkbox-toggle.scss';
import './theme/reorder.scss';
import './theme/searchbar.scss';
import './theme/tabs.scss';
import './theme/segment.scss';
import './theme/alert.scss';
import './theme/toolbar.scss';
import './theme/link.scss';

import './helpers/i18n';

import { RootProps, rootConnector } from './store/thunks/index.thunks';

import TaskModal from './modals/task/TaskModal';
import TaskDetails from './pages/details/task/TaskDetails';
import ClientDetails from './pages/details/client/ClientDetails';
import About from './pages/about/About';
import Terms from './pages/terms/Terms';
import Privacy from './pages/privacy/Privacy';

const App: React.FC<RootProps> = (props: RootProps) => {

  const [selectedTab, setSelectedTab] = useState<string>('home');

  async function init() {
    // Init theme first
    await props.initTheme();

    // Init data
    const promises = [];
    promises.push(props.initClients());
    promises.push(props.initActiveProjects());
    promises.push(props.initTask());
    promises.push(props.computeSummary());
    promises.push(props.listTasks());
    promises.push(props.listProjectsInvoices());
    promises.push(props.initSettings());

    await Promise.all(promises);
  }


  useEffect(() => {
    init();

    initSelectedTab();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initSelectedTab() {
    const element: HTMLElement | null = document.querySelector('ion-tab-bar');

    if (element) {
      const selected: string = (element as any).selectedTab;
      setSelectedTab(selected ? selected : 'home');
    }
  }

  return (
    <Suspense fallback="loading">
      <IonApp>
        <IonReactRouter>
          <IonTabs onIonTabsDidChange={($event) => setSelectedTab($event.detail.tab)}>
            <IonRouterOutlet>
              <Route path="/home" component={Home} />
              <Route path="/invoices" component={Invoices} exact={true} />
              <Route path="/settings" component={Settings} exact={true} />

              <Route path="/about" component={About} exact={true} />
              <Route path="/terms" component={Terms} exact={true} />
              <Route path="/privacy" component={Privacy} exact={true} />

              <Route path="/client/:id" component={ClientDetails} />
              <Route path="/task/:day/:id" component={TaskDetails} />

              <Route path="/" render={() => <Redirect to="/home" />} exact={true} />
            </IonRouterOutlet>

            <IonTabBar slot="bottom">
              <IonTabButton tab="home" href="/home">
                {
                  selectedTab === 'home' ? <IonIcon src="/assets/icon/logo.svg" ariaLabel="Tie Tracker logo" /> : <IonIcon src="/assets/icon/logo-grey.svg" ariaLabel="Tie Tracker logo" />
                }
                <IonLabel>Home</IonLabel>
              </IonTabButton>
              <IonTabButton tab="invoices" href="/invoices">
                <IonIcon icon={card} />
                <IonLabel>Invoices</IonLabel>
              </IonTabButton>
              <IonTabButton tab="settings" href="/settings">
                <IonIcon icon={options} />
                <IonLabel>Settings</IonLabel>
              </IonTabButton>
              <IonTabButton tab="about" href="/about">
                <IonIcon icon={information} />
                <IonLabel>About</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>

        <TaskModal></TaskModal>
      </IonApp>
    </Suspense>
  );
}

export default rootConnector(App);
