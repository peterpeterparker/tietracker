import React, {FormEvent, useState} from 'react';
import {useSelector} from 'react-redux';

import {
    IonContent,
    IonLabel,
    IonPage,
    IonSpinner,
    IonButton,
    IonSegment,
    IonSegmentButton
} from '@ionic/react';

import {rootConnector, RootProps} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import {Settings as SettingsModel} from '../../models/settings';

import SettingsGeneral from '../../components/settings/general/SettingsGeneral';
import SettingsDescription from '../../components/settings/description/SettingsDescription';

import Header from '../../components/header/Header';

enum SettingsCategory {
    GENERAL = 'general',
    DESCRIPTION = 'description'
}

const Settings: React.FC<RootProps> = (props) => {

    const settings: SettingsModel = useSelector((state: RootState) => state.settings.settings);

    const [saving, setSaving] = useState<boolean>(false);

    const [category, setCategory] = useState<SettingsCategory>(SettingsCategory.GENERAL);

    async function handleSubmit($event: FormEvent<HTMLFormElement>) {
        $event.preventDefault();

        setSaving(true);

        try {
            await props.updateSettings(settings);
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
                    {renderSettingsCategory()}
                    {renderSettings()}
                </main>
            </IonContent>
        </IonPage>
    );

    function renderSettings() {
        if (!settings || settings === undefined) {
            return <div className="spinner"><IonSpinner color="primary"></IonSpinner></div>;
        }

        return <form onSubmit={($event: FormEvent<HTMLFormElement>) => handleSubmit($event)}>
            {renderSettingsGeneral()}
            {renderSettingsDescription()}

            <IonButton type="submit" disabled={saving} aria-label="Update task" color="button" className="ion-margin-top">
                <IonLabel>Save</IonLabel>
            </IonButton>
        </form>
    }

    function renderSettingsGeneral() {
        if (category !== SettingsCategory.GENERAL) {
            return undefined;
        }

        return <SettingsGeneral settings={settings}></SettingsGeneral>;
    }

    function renderSettingsDescription() {
        if (category !== SettingsCategory.DESCRIPTION) {
            return undefined;
        }

        return <SettingsDescription settings={settings}></SettingsDescription>;
    }

    function renderSettingsCategory() {
        if (!settings || settings === undefined) {
            return undefined;
        }

        return <IonSegment mode="md" class="ion-padding-bottom" onIonChange={($event: CustomEvent) => selectCategory($event)}>
            <IonSegmentButton value={SettingsCategory.GENERAL} checked={category === SettingsCategory.GENERAL} mode="md">
                <ion-label>General</ion-label>
            </IonSegmentButton>
            <IonSegmentButton value={SettingsCategory.DESCRIPTION} checked={category === SettingsCategory.DESCRIPTION} mode="md">
                <ion-label>Description</ion-label>
            </IonSegmentButton>
        </IonSegment>
    }
};

export default rootConnector(Settings);
