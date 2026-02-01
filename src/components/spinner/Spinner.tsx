import {IonLabel} from '@ionic/react';
import React, {CSSProperties, Ref, useEffect, useRef} from 'react';

import {useSelector} from 'react-redux';

import {useTranslation} from 'react-i18next';

import styles from './Spinner.module.scss';

import {differenceInSeconds} from 'date-fns';

import {RootState} from '../../store/reducers';
import {rootConnector, RootProps} from '../../store/thunks/index.thunks';

import {Summary as SummaryData} from '../../store/interfaces/summary';
import {TaskInProgress} from '../../store/interfaces/task.inprogress';
import {formatSeconds} from '../../utils/utils.time';

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

  const timeElapsed: string = '00:00:00';

  const timeElapsedRef: Ref<HTMLHeadingElement> = useRef<HTMLHeadingElement>(null);
  const todayTimeElapsedRef: Ref<HTMLIonLabelElement> = useRef<HTMLIonLabelElement>(null);

  const todayTimeLabel: string = t('tracker.today');

  useEffect(() => {
    const progressInterval = window.setInterval(() => {
      if (taskInProgress && taskInProgress.data && !props.freeze) {
        const now = new Date();

        const seconds = differenceInSeconds(now, taskInProgress.data.from);

        if (timeElapsedRef && timeElapsedRef.current) {
          timeElapsedRef.current.innerHTML = formatSeconds(seconds);
        }

        if (summary && summary.total && summary.total.today.milliseconds > 0) {
          const todaySeconds = summary.total.today.milliseconds / 1000;

          const todayTimeElapsed = formatSeconds(todaySeconds + seconds);

          if (todayTimeElapsedRef && todayTimeElapsedRef.current) {
            todayTimeElapsedRef.current.innerHTML = `${todayTimeLabel} ${todayTimeElapsed}`;
          }
        }
      }
    }, 1000);

    return () => clearInterval(progressInterval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);

  const inlineStyle =
    props.color !== undefined
      ? ({
          '--progress-color-contrast': props.contrast ? props.contrast : 'white',
          '--freeze-progress': `${props.freeze ? 'paused' : 'running'}`,
        } as CSSProperties)
      : undefined;

  // SVG: https://codepen.io/supah/pen/BjYLdW

  return (
    <article className={styles.container} style={inlineStyle}>
      <svg className={styles.spinner} viewBox="0 0 50 50">
        <circle className={styles.path} cx="25" cy="25" r="20"></circle>
      </svg>

      <h1 ref={timeElapsedRef} className={styles.text}>
        {timeElapsed}
      </h1>

      <IonLabel ref={todayTimeElapsedRef} className={styles.subtext}></IonLabel>
    </article>
  );
};

export default rootConnector(Spinner);
