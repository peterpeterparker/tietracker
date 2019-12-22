import React, {FormEvent, useState} from 'react';
import {useSelector} from 'react-redux';

import {
    IonContent,
    IonHeader,
    IonLabel,
    IonPage,
    IonSpinner,
    IonTitle,
    IonToolbar,
    IonButton,
} from '@ionic/react';

import {rootConnector, RootProps} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import {Settings as SettingsModel} from '../../models/settings';
import SettingsGeneral from '../../components/settings/general/SettingsGeneral';

const Settings: React.FC<RootProps> = (props) => {

    const settings: SettingsModel = useSelector((state: RootState) => state.settings.settings);

    const [saving, setSaving] = useState<boolean>(false);

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

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>Settings</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {renderSettings()}
            </IonContent>
        </IonPage>
    );

    function renderSettings() {
        if (!settings || settings === undefined) {
            return <div className="spinner"><IonSpinner color="primary"></IonSpinner></div>;
        }

        return <form onSubmit={($event: FormEvent<HTMLFormElement>) => handleSubmit($event)}>
            <SettingsGeneral settings={settings}></SettingsGeneral>

            <IonButton type="submit" disabled={saving} aria-label="Update task">
                <IonLabel>Save</IonLabel>
            </IonButton>
        </form>
    }
};

export default rootConnector(Settings);
