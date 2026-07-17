import {RootProps} from '../store/thunks/index.thunks';

export const initAllData = async (props: RootProps) => {
  // Load settings
  const settings = await props.initSettings();
  const initArgs = {settings};

  // Init main data first if a task is on going
  await props.initTask(initArgs);

  // Everything else in parallel
  const promises = [];

  promises.push(props.initClients(initArgs));
  promises.push(props.initActiveProjects());
  promises.push(props.computeSummary());
  promises.push(props.listTasks({...initArgs, forDate: new Date()}));
  promises.push(props.listProjectsInvoices(initArgs));

  await Promise.all(promises);
};
