import {IdbStorage} from '../../services/_idb.storage';
import {Project, ProjectData, ProjectId} from '../../types/project';
import {isNullish, nonNullish} from '../../utils/utils.nullish';
import {Client, ClientData, ClientId} from '../../types/client';
import {Task} from "../../types/task";
import {addMinutes, differenceInMilliseconds} from 'date-fns';
import {WorkerClients, WorkerProjects} from './utils.types';
import {format} from 'date-fns';
import {differenceInMilliseconds} from 'date-fns';
import {i18nExportLabels} from '../../utils/utils.export';

export type ExportableInvoices = (string | number | Date)[][];

export const convertTasks = ({
  tasks,
  projects,
  clients,
}: {
  tasks: Task[];
  projects: WorkerProjects;
  clients: Option<WorkerClients>;
}): ExportableInvoices => {
  return tasks.map((task) => {
    const milliseconds = differenceInMilliseconds(
      new Date(task.data.to ?? Date.now()),
      new Date(task.data.from),
    );
    const hours = milliseconds > 0 ? milliseconds / (1000 * 60 * 60) : 0;

    const rate = projects[task.data.project_id].rate;
    const billable = rate && rate.hourly > 0 ? hours * rate.hourly : 0;

    // #47: ExcelJS timezone workaround
    const utcOffsetMinutes = -new Date().getTimezoneOffset();
    const from = addMinutes(new Date(task.data.from), utcOffsetMinutes);
    const to = addMinutes(new Date(task.data.to ?? Date.now()), utcOffsetMinutes);

    const result = [
      task.data.description ? task.data.description : '',
      from,
      from,
      to,
      to,
      printMilliseconds(differenceInMilliseconds(to, from)),
      billable,
    ];

    if (nonNullish(clients)) {
      return [
        clients[task.data.client_id] ? clients[task.data.client_id].name : '',
        projects[task.data.project_id] ? projects[task.data.project_id].name : '',
        ...result,
      ];
    }

    return result;
  });
}

const printMilliseconds = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);

  const hours = Math.floor(minutes / 60);
  minutes = minutes % 60;

  return `${hours >= 10 ? hours : '0' + hours}:${minutes >= 10 ? minutes : '0' + minutes}`;
}

export const initColumns = ({
  i18n,
  backup,
  total,
}: {
  i18n: i18nExportLabels;
  backup: boolean;
  total: TotalInvoices;
}) => {
  const {duration: totalDuration} = total;

  let columns = [
    {name: i18n.description, filterButton: true, totalsRowLabel: ''},
    {name: i18n.start_date},
    {name: i18n.start_time},
    {name: i18n.end_date},
    {name: i18n.end_time},
    {
      name: i18n.duration,
      totalsRowFunction: 'custom' as const,
      totalsRowFormula: `"${printMilliseconds(totalDuration)}"`,
    },
    {name: i18n.billable, totalsRowFunction: 'sum' as const},
  ];

  if (backup) {
    columns = [
      {name: i18n.client, filterButton: true, totalsRowLabel: ''},
      {name: i18n.project, filterButton: true, totalsRowLabel: ''},
      ...columns,
    ];
  }

  return columns;
};

export const footerText = (signature: string | undefined): string => {
  const today = format(new Date(), 'yyyy-MM-dd');

  return nonNullish(signature) ? `${signature} - ${today}` : today;
};

interface TotalInvoices {
  duration: number;
  sum: number;
}

export const totalInvoices = (invoices: ExportableInvoices): {duration: number, sum: number} => {
  const totalDuration = invoices.reduce((accumulator, invoice) => {
    return accumulator + differenceInMilliseconds(new Date(invoice[4]), new Date(invoice[2]));
  }, 0);

  const sumBillable = invoices.reduce((accumulator, invoice) => {
    return accumulator + (invoice[6] as number);
  }, 0);

  return {
    duration: totalDuration,
    sum: sumBillable,
  };
};