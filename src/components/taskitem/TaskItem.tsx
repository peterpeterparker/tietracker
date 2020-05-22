import React, {CSSProperties} from 'react';
import {useSelector} from 'react-redux';

import {IonItem, IonLabel} from '@ionic/react';

import {useTranslation} from 'react-i18next';

import styles from './TaskItem.module.scss';

import {TaskItem as TaskItemStore} from '../../store/interfaces/task.item';
import {rootConnector, RootProps} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import {formatTime} from '../../utils/utils.time';
import {formatCurrency} from '../../utils/utils.currency';

import {Settings} from '../../models/settings';

interface TaskItemProps extends RootProps {
  task: TaskItemStore;
  tasksDay: string | undefined;
}

const TaskItem: React.FC<TaskItemProps> = (props) => {
  const {t} = useTranslation('tasks');

  const settings: Settings = useSelector((state: RootState) => state.settings.settings);

  return (
    <IonItem className={styles.item} lines="none" detail={false} routerLink={`/task/${props.tasksDay}/${props.task.id}`}>
      <div slot="start" style={{background: props.task.data.client.color} as CSSProperties}></div>

      <IonLabel>
        {props.task.data.description ? <h2>{props.task.data.description}</h2> : t('item.no_description')}
        <p>
          {formatTime(props.task.data.milliseconds)} - {formatCurrency(props.task.data.billable, settings.currency.currency)}
        </p>
      </IonLabel>
    </IonItem>
  );
};

export default rootConnector(TaskItem);
