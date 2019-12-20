import React from 'react';

import {IonHeader, IonTitle, IonToolbar, isPlatform} from '@ionic/react';

class Header extends React.Component {

    render() {
        if (isPlatform('mobile')) {
            return <></>;
        }

        return <IonHeader>
            <IonToolbar color="primary">
                <IonTitle>Get Slick Done</IonTitle>
            </IonToolbar>
        </IonHeader>;
    }
}

export default Header;
