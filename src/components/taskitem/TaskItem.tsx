import {IonItem, IonLabel} from '@ionic/react';
import React, {CSSProperties} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {TaskItem as TaskItemStore} from '../../lib/store/interfaces/task.item';
import {RootState} from '../../lib/store/reducers';
import {rootConnector, RootProps} from '../../lib/store/thunks/index.thunks';
import {Settings} from '../../lib/types/settings';
import {formatCurrency} from '../../lib/utils/utils.currency';
import {formatTime} from '../../lib/utils/utils.time';
import styles from './TaskItem.module.scss';

interface TaskItemProps extends RootProps {
  task: TaskItemStore;
  tasksDay: string | undefined;
}

const TaskItem: React.FC<TaskItemProps> = (props) => {
  const {t} = useTranslation('tasks');

  const settings: Settings = useSelector((state: RootState) => state.settings.settings);

  return (
    <IonItem
      className={styles.item}
      lines="none"
      detail={false}
      routerLink={`/task/${props.tasksDay}/${props.task.id}`}>
      <div slot="start" style={{background: props.task.data.client.color} as CSSProperties}></div>

      <IonLabel>
        {props.task.data.description ? (
          <h2>{props.task.data.description}</h2>
        ) : (
          t('item.no_description')
        )}
        <p>
          {formatTime(props.task.data.milliseconds)} -{' '}
          {formatCurrency(props.task.data.billable, settings.currency.currency)}
        </p>
      </IonLabel>
    </IonItem>
  );
};

export default rootConnector(TaskItem);
