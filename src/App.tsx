import React, { Suspense, useEffect } from 'react';
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

import { options, card } from 'ionicons/icons';

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

import './helpers/i18n';

import { RootProps, rootConnector } from './store/thunks/index.thunks';

import Task from './modals/task/Task';
import TaskDetails from './pages/details/task/TaskDetails';

const App: React.FC<RootProps> = (props: RootProps) => {

  async function initInitialState() {
    const promises = [];
    promises.push(props.initClients());
    promises.push(props.initActiveProjects());
    promises.push(props.initTask());
    promises.push(props.computeSummary());
    promises.push(props.listTasks());
    promises.push(props.listProjectsInvoices());

    await Promise.all(promises);
  }

  useEffect(() => {
    initInitialState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense fallback="loading">
      <IonApp>
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet>
              <Route path="/home" component={Home} exact={true} />
              <Route path="/invoices" component={Invoices} />
              <Route path="/settings" component={Settings} exact={true} />

              <Route path="/task/:day/:id" component={TaskDetails} />

              <Route path="/" render={() => <Redirect to="/home" />} exact={true} />
            </IonRouterOutlet>

            <IonTabBar slot="bottom">
              <IonTabButton tab="home" href="/home">
                <IonIcon src="/assets/icon/gsd-logo.svg" ariaLabel="Get Slick Done logo" />
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
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>

        <Task></Task>
      </IonApp>
    </Suspense>
  );
}

export default rootConnector(App);
