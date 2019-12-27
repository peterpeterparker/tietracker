import React, {useEffect, useState} from 'react';

import {Settings} from '../../../models/settings';
import {
    IonItem,
    IonLabel,
    IonList,
    IonToggle,
} from '@ionic/react';

import {ThemeService} from '../../../services/theme/theme.service';

export interface SettingsGeneralProps {
    settings: Settings;
}

const SettingsGeneral: React.FC<SettingsGeneralProps> = (props) => {

    const [darkTheme, setDarkTheme] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        ThemeService.getInstance().setState((dark: boolean) => {
            if (darkTheme === undefined) {
                setDarkTheme(dark)
            }
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function toggleTheme($event: any) {
        if ($event && $event.detail) {
            await ThemeService.getInstance().switch($event.detail.checked);
        }
    }

    return (
        <IonList className="inputs-list">
            <IonItem className="item-title">
                <IonLabel>Theme</IonLabel>
            </IonItem>

            <IonItem className="item-input item-radio with-padding">
                <IonLabel>{darkTheme ? 'Dark' : 'Light'} {darkTheme ? '🌑' : '☀️'}</IonLabel>
                <IonToggle slot="end" checked={darkTheme} mode="md" color="medium"
                           onIonChange={($event) => toggleTheme($event)}></IonToggle>
            </IonItem>
        </IonList>
    );

};

export default SettingsGeneral;
