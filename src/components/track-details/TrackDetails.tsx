import {IonLabel} from '@ionic/react';
import {differenceInSeconds} from 'date-fns';
import React, {CSSProperties, useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {TaskInProgressClientData} from '../../store/interfaces/task.inprogress';
import {RootState} from '../../store/reducers';
import {rootConnector, RootProps} from '../../store/thunks/index.thunks';
import {formatSeconds} from '../../utils/utils.time';
import styles from './TrackDetails.module.scss';

interface TrackDetailsProps extends RootProps {
  contrastColor: string;
  client: TaskInProgressClientData | undefined;
  freeze: boolean;
}

const TrackDetails: React.FC<TrackDetailsProps> = ({contrastColor, client, freeze}) => {
  const {t} = useTranslation('tasks');

  const taskInProgress = useSelector((state: RootState) => {
    return state.tasks.taskInProgress;
  });

  const summary = useSelector((state: RootState) => state.summary.summary);

  const weekTimeElapsedRef = useRef<HTMLIonLabelElement>(null);

  const weekTimeLabel = t('tracker.week');

  useEffect(() => {
    const progressInterval = window.setInterval(() => {
      if (taskInProgress && taskInProgress.data && !freeze) {
        const now = new Date();

        const seconds = differenceInSeconds(now, taskInProgress.data.from);

        if (summary && summary.total && summary.total.week.milliseconds > 0) {
          const weekSeconds = summary.total.week.milliseconds / 1000;

          const weekTimeElapsed = formatSeconds(weekSeconds + seconds);

          if (weekTimeElapsedRef && weekTimeElapsedRef.current) {
            weekTimeElapsedRef.current.innerHTML = `${weekTimeLabel} ${weekTimeElapsed}`;
          }
        }
      }
    }, 1000);

    return () => clearInterval(progressInterval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);

  return (
    <div className={`${styles.container} ion-padding`}>
      {(summary?.total?.week?.milliseconds ?? 0) > 0 && (
        <IonLabel style={{color: contrastColor} as CSSProperties} ref={weekTimeElapsedRef}>
          {weekTimeLabel} 00:00:00
        </IonLabel>
      )}
      <IonLabel style={{color: contrastColor} as CSSProperties} className={styles.client}>
        {client?.name}
      </IonLabel>
    </div>
  );
};

export default rootConnector(TrackDetails);
