import {IonSpinner} from '@ionic/react';

import styles from './Loading.module.scss';

function Loading() {
  return (
    <div className={styles.spinner}>
      <IonSpinner color="medium"></IonSpinner>
    </div>
  );
}

export default Loading;
