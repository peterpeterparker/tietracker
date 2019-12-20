import React from 'react';

import {IonHeader, IonTitle, IonToolbar, isPlatform} from '@ionic/react';

import styles from './Header.module.scss';

class Header extends React.Component {

    render() {
        if (isPlatform('mobile')) {
            return <></>;
        }

        return <IonHeader>
            <IonToolbar color="primary">
                <IonTitle>
                    <div className={styles.title}>
                        <div>
                            <img src="/assets/icon/gsd-logo.svg" alt="Get Slick Done logo" height="18"/>
                        </div>
                    </div>
                </IonTitle>
            </IonToolbar>
        </IonHeader>;
    }
}

export default Header;
