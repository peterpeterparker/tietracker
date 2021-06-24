import {RootProps} from '../store/thunks/index.thunks';

export const initAllData = async (props: RootProps) => {
  // Init data
  const promises = [];

  promises.push(props.initClients());
  promises.push(props.initActiveProjects());
  promises.push(props.initTask());
  promises.push(props.computeSummary());
  promises.push(props.listTasks(new Date()));
  promises.push(props.listProjectsInvoices());
  promises.push(props.initSettings());

  await Promise.all(promises);
};
