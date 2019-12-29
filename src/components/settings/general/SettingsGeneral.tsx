import React from 'react';
import {useSelector} from 'react-redux';

import {
    IonItem,
    IonLabel,
    IonList,
    IonToggle,
} from '@ionic/react';

import {rootConnector, RootProps} from '../../../store/thunks/index.thunks';
import {RootState} from '../../../store/reducers';

const SettingsGeneral: React.FC<RootProps> = (props) => {

    const darkTheme: boolean | undefined = useSelector((state: RootState) => {
        return state.theme.dark;
    });

    async function toggleTheme() {
        await props.switchTheme();
    }

    return (
        <IonList className="inputs-list">
            <IonItem className="item-title">
                <IonLabel>Theme</IonLabel>
            </IonItem>

            <IonItem className="item-input item-radio with-padding">
                <IonLabel>{darkTheme ? 'Dark' : 'Light'} {darkTheme ? '🌑' : '☀️'}</IonLabel>
                <IonToggle slot="end" checked={darkTheme} mode="md" color="medium"
                           onClick={() => toggleTheme()}></IonToggle>
            </IonItem>
        </IonList>
    );

};

export default rootConnector(SettingsGeneral);
