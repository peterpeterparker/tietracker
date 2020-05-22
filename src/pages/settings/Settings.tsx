import React, {FormEvent, useState} from 'react';
import {useSelector} from 'react-redux';

import {IonContent, IonLabel, IonPage, IonSpinner, IonButton, IonSegment, IonSegmentButton, IonHeader, IonToolbar, IonToast} from '@ionic/react';

import {useTranslation} from 'react-i18next';

import {rootConnector, RootProps} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import {Settings as SettingsModel} from '../../models/settings';

import SettingsGeneral from '../../components/settings/general/SettingsGeneral';
import SettingsTemplates from '../../components/settings/templates/SettingsTemplates';
import SettingsTracker from '../../components/settings/tracker/SettingsTracker';

import Header from '../../components/header/Header';

enum SettingsCategory {
  GENERAL = 'general',
  TRACKER = 'tracker',
  TEMPLATES = 'templates',
}

const Settings: React.FC<RootProps> = (props) => {
  const {t} = useTranslation(['settings', 'common']);

  const settings: SettingsModel = useSelector((state: RootState) => state.settings.settings);

  const [saving, setSaving] = useState<boolean>(false);
  const [showSaveMsg, setShowSaveMsg] = useState<boolean>(false);

  const [category, setCategory] = useState<SettingsCategory>(SettingsCategory.GENERAL);

  async function handleSubmit($event: FormEvent<HTMLFormElement>) {
    $event.preventDefault();

    setSaving(true);

    try {
      await props.updateSettings(settings);

      setShowSaveMsg(true);
    } catch (err) {
      // TODO show err
      console.error(err);
    }

    setSaving(false);
  }

  function selectCategory($event: CustomEvent) {
    if ($event && $event.detail) {
      setCategory($event.detail.value);
    }
  }

  return (
    <IonPage>
      <IonContent>
        <Header></Header>

        <main className="ion-padding">
          <IonHeader>
            <IonToolbar className="title">{renderSettingsCategory()}</IonToolbar>
          </IonHeader>

          {renderSettings()}
        </main>
      </IonContent>
    </IonPage>
  );

  function renderSettings() {
    if (!settings || settings === undefined) {
      return (
        <div className="spinner">
          <IonSpinner color="primary"></IonSpinner>
        </div>
      );
    }

    return (
      <form onSubmit={($event: FormEvent<HTMLFormElement>) => handleSubmit($event)}>
        {renderSettingsGeneral()}
        {renderSettingsTracker()}
        {renderSettingsDescription()}

        {renderSave()}
        {renderSaveMsg()}
      </form>
    );
  }

  function renderSaveMsg() {
    return <IonToast isOpen={showSaveMsg} color="primary" onDidDismiss={() => setShowSaveMsg(false)} message={t('settings:save.msg')} duration={500} />;
  }

  function renderSave() {
    return (
      <IonButton type="submit" disabled={saving} aria-label={t('settings:save.action')} color="button" className="ion-margin-top">
        <IonLabel>{t('common:actions.save')}</IonLabel>
      </IonButton>
    );
  }

  function renderSettingsGeneral() {
    if (category !== SettingsCategory.GENERAL) {
      return undefined;
    }

    return <SettingsGeneral settings={settings} switchTheme={props.switchTheme}></SettingsGeneral>;
  }

  function renderSettingsTracker() {
    if (category !== SettingsCategory.TRACKER) {
      return undefined;
    }

    return <SettingsTracker settings={settings}></SettingsTracker>;
  }

  function renderSettingsDescription() {
    if (category !== SettingsCategory.TEMPLATES) {
      return undefined;
    }

    return <SettingsTemplates settings={settings}></SettingsTemplates>;
  }

  function renderSettingsCategory() {
    if (!settings || settings === undefined) {
      return undefined;
    }

    return (
      <IonSegment mode="md" class="ion-padding-bottom" value={category} onIonChange={($event: CustomEvent) => selectCategory($event)}>
        <IonSegmentButton value={SettingsCategory.GENERAL} mode="md">
          <ion-label>{t('settings:segments.general')}</ion-label>
        </IonSegmentButton>
        <IonSegmentButton value={SettingsCategory.TRACKER} mode="md">
          <ion-label>{t('settings:segments.tracker')}</ion-label>
        </IonSegmentButton>
        <IonSegmentButton value={SettingsCategory.TEMPLATES} mode="md">
          <ion-label>{t('settings:segments.templates')}</ion-label>
        </IonSegmentButton>
      </IonSegment>
    );
  }
};

export default rootConnector(Settings);
