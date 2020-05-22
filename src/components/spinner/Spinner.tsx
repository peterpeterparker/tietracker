import React, {CSSProperties, useEffect, useState} from 'react';
import {IonLabel} from '@ionic/react';

import {useSelector} from 'react-redux';

import {useTranslation} from 'react-i18next';

import styles from './Spinner.module.scss';

import {differenceInSeconds} from 'date-fns';

import {RootProps, rootConnector} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import {Summary as SummaryData} from '../../store/interfaces/summary';
import {TaskInProgress} from '../../store/interfaces/task.inprogress';

interface SpinnerProps extends RootProps {
  color: string | undefined;
  contrast: string;
  freeze: boolean;
}

const Spinner: React.FC<SpinnerProps> = (props: SpinnerProps) => {
  const {t} = useTranslation('tasks');

  const taskInProgress: TaskInProgress | undefined = useSelector((state: RootState) => {
    return state.tasks.taskInProgress;
  });

  const summary: SummaryData | undefined = useSelector((state: RootState) => state.summary.summary);

  const [timeElapsed, setTimeElapsed] = useState<string>('00:00:00');
  const [todayTimeElapsed, setTodayTimeElapse] = useState<string>('00:00:00');

  useEffect(() => {
    const progressInterval = window.setInterval(async () => {
      if (taskInProgress && taskInProgress.data && !props.freeze) {
        const now: Date = new Date();

        const seconds: number = differenceInSeconds(now, taskInProgress.data.from);

        let todayTimeElapsed: string = await formatTime(0);

        if (summary && summary.total && summary.total.today.milliseconds > 0) {
          const todaySeconds: number = summary.total.today.milliseconds / 1000;

          todayTimeElapsed = await formatTime(todaySeconds + seconds);
        }

        setTimeElapsed(await formatTime(seconds));
        setTodayTimeElapse(todayTimeElapsed);
      }
    }, 1000);

    // eslint-disable-next-line
    return () => clearInterval(progressInterval);
  });

  async function formatTime(seconds: number): Promise<string> {
    const diffHours: number = Math.floor(seconds / 3600);
    seconds = seconds % 3600;
    const diffMinutes: number = Math.floor(seconds / 60);
    const diffSeconds: number = seconds % 60;

    return `${diffHours >= 99 ? '99' : diffHours < 10 ? '0' + diffHours : diffHours}:${diffMinutes < 10 ? '0' + diffMinutes : diffMinutes}:${
      diffSeconds < 10 ? '0' + diffSeconds : diffSeconds
    }`;
  }

  return renderSpinner();

  function renderSpinner() {
    const inlineStyle =
      props.color !== undefined
        ? ({
            '--progress-color': props.color,
            '--progress-color-contrast': props.contrast ? props.contrast : 'white',
            '--freeze-progress': `${props.freeze ? 'paused' : 'running'}`,
          } as CSSProperties)
        : undefined;

    // https://codepen.io/supah/pen/BjYLdW
    return (
      <div className={styles.container} style={inlineStyle}>
        <svg className={styles.spinner} viewBox="0 0 50 50">
          <circle className={styles.background} cx="25" cy="25" r="20"></circle>
          <circle className={styles.path} cx="25" cy="25" r="20"></circle>
        </svg>
        {timeElapsed !== undefined ? <h1 className={styles.text}>{timeElapsed}</h1> : undefined}

        {todayTimeElapsed !== undefined && todayTimeElapsed !== '00:00:00' ? (
          <IonLabel className={styles.subtext}>
            {t('tracker.today')} {todayTimeElapsed}
          </IonLabel>
        ) : undefined}
      </div>
    );
  }
};

export default rootConnector(Spinner);
