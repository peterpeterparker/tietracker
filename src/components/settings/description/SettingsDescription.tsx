import React from 'react';

import {IonItem, IonLabel, IonReorderGroup, IonReorder, IonList} from '@ionic/react';
import {ItemReorderEventDetail} from '@ionic/core';

import styles from './SettingsDescription.module.scss';

import {Settings} from '../../../models/settings';

export interface SettingsGeneralProps {
    settings: Settings;
}

const SettingsDescription: React.FC<SettingsGeneralProps> = (props) => {

    function doReorder($event: CustomEvent<ItemReorderEventDetail>) {
        if (!$event || !$event.detail) {
            return;
        }

        if ($event.detail.from === $event.detail.to) {
            return;
        }

        if (props.settings.descriptions === undefined || props.settings.descriptions.length <= 0) {
            return;
        }

        const newDescriptions: string[] = [...props.settings.descriptions];

        newDescriptions.splice($event.detail.to, 0, ...newDescriptions.splice($event.detail.from, 1));

        $event.detail.complete();
    }

    return (<>
            <IonList className={`inputs-list ${styles.introduction}`}>
                <IonItem className="item-title">
                    <IonLabel>Commonly used task descriptions</IonLabel>
                </IonItem>
            </IonList>
            <IonReorderGroup disabled={false} className="reorder-list ion-margin-bottom" onIonItemReorder={doReorder}>
                {renderDescriptions()}
            </IonReorderGroup>
        </>
    );

    function renderDescriptions() {
        if (!props.settings || !props.settings.descriptions || props.settings.descriptions.length <= 0) {
            return [];
        }

        return props.settings.descriptions.map((description: string, i: number) => {
            return <IonItem key={`description-${i}`}>
                <IonLabel>{description}</IonLabel>
                <IonReorder slot="end"/>
            </IonItem>
        });
    }
};

export default SettingsDescription;
