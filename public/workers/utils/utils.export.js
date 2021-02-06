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
      {formula: `TEXT(INDIRECT(("${backup ? 'G' : 'E'}" & ROW()))-INDIRECT(("${backup ? 'E' : 'C'}" & ROW())),"hh:mm")`},
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
