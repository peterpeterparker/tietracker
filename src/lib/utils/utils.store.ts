import {RootProps} from '../store/thunks/index.thunks';

export const initAllData = async (props: RootProps) => {
  // Init main data if a task is on going
  await props.initTask();
  await props.initSettings();

  // Everything else in parallel
  const promises = [];

  promises.push(props.initClients());
  promises.push(props.initActiveProjects());
  promises.push(props.computeSummary());
  promises.push(props.listTasks(new Date()));
  promises.push(props.listProjectsInvoices());

  await Promise.all(promises);
};
