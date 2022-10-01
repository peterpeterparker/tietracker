function convertTasks(tasks, projects, clients, backup) {
  const results = tasks.map((task, index) => {
    const milliseconds = dayjs(task.data.to).diff(new Date(task.data.from));
    const hours = milliseconds > 0 ? milliseconds / (1000 * 60 * 60) : 0;

    const rate = projects[task.data.project_id].rate;
    const billable = rate && rate.hourly > 0 ? hours * rate.hourly : 0;

    // #47: ExcelJS timezone workaround
    const from = dayjs(task.data.from).add(dayjs().utcOffset(), 'minute').toDate();
    const to = dayjs(task.data.to).add(dayjs().utcOffset(), 'minute').toDate();

    const result = [
      task.data.description ? task.data.description : '',
      new Date(from),
      new Date(from),
      new Date(to),
      new Date(to),
      printMilliseconds(dayjs(new Date(to)).diff(new Date(from))),
      billable,
    ];

    if (clients) {
      return [
        clients[task.data.client_id] ? clients[task.data.client_id].name : '',
        projects[task.data.project_id] ? projects[task.data.project_id].name : '',
        ...result,
      ];
    } else {
      return result;
    }
  });

  return results;
}

const initColumns = (invoices, i18n, backup, total) => {
  const {duration: totalDuration} = total;

  let columns = [
    {name: i18n.description, filterButton: true, totalsRowLabel: ''},
    {name: i18n.start_date},
    {name: i18n.start_time},
    {name: i18n.end_date},
    {name: i18n.end_time},
    {
      name: i18n.duration,
      totalsRowFunction: 'custom',
      totalsRowFormula: `"${printMilliseconds(totalDuration)}"`,
    },
    {name: i18n.billable, totalsRowFunction: 'sum'},
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

const footerText = (signature) => {
  const today = dayjs().format('YYYY-MM-DD');

  return signature ? `${signature} - ${today}` : today;
};

const printMilliseconds = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);

  const hours = Math.floor(minutes / 60);
  minutes = minutes % 60;

  return `${hours >= 10 ? hours : '0' + hours}:${minutes >= 10 ? minutes : '0' + minutes}`;
};

const totalInvoices = (invoices) => {
  const totalDuration = invoices.reduce((accumulator, invoice) => {
    return accumulator + dayjs(invoice[4]).diff(invoice[2]);
  }, 0);

  const sumBillable = invoices.reduce((accumulator, invoice) => {
    return accumulator + invoice[6];
  }, 0);

  return {
    duration: totalDuration,
    sum: sumBillable,
  };
};
