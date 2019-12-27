import React from 'react';

import {IonHeader, IonTitle, IonToolbar, isPlatform} from '@ionic/react';

import styles from './Header.module.scss';

class Header extends React.Component {

    render() {
        if (isPlatform('mobile')) {
            return <></>;
        }

        return <IonHeader>
            <IonToolbar>
                <IonTitle>
                    <div className={styles.title}>
                        <div>
                            <img src="/assets/icon/logo.svg" alt="Tie Tracker logo" height="18"/>
                        </div>
                        <span>Tie Tracker</span>
                    </div>
                </IonTitle>
            </IonToolbar>
        </IonHeader>;
    }
}

export default Header;
