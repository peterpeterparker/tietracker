importScripts('./libs/idb-keyval-iife.min.js');
importScripts('./libs/dayjs.min.js');

self.onmessage = async ($event) => {
  if ($event && $event.data && $event.data.msg === 'compute') {
    await self.compute($event.data.days);
  }
};

self.compute = async (days) => {
  const projects = await loadProjectsRate();

  if (!projects || projects === undefined) {
    self.postEmptyMsg();

    return;
  }

  const result = await computeSum(projects, days);

  self.postMessage(result);
};

function postEmptyMsg() {
  self.postMessage({
    days: [],
    total: {
      week: {
        milliseconds: 0,
        billable: 0,
      },
      today: {
        milliseconds: 0,
        billable: 0,
      },
    },
  });
}

function loadProjectsRate() {
  return new Promise(async (resolve) => {
    const projects = await idbKeyval.get('projects');

    if (!projects || projects.length <= 0) {
      resolve(undefined);
      return;
    }

    let result = {};
    projects.forEach((project) => {
      result[project.id] = project.data.rate ? project.data.rate : {hourly: 0, vat: false};
    });

    resolve(result);
  });
}

async function computeSum(projects, days) {
  const promises = days.map((day) => {
    return computeDaySum(day, projects);
  });

  const daily = await Promise.all(promises);

  if (!daily || daily.length <= 0) {
    self.postEmptyMsg();

    return;
  }

  const sumDuration = daily.reduce((a, b) => {
    return a + b.milliseconds;
  }, 0);

  const sumBillable = daily.reduce((a, b) => {
    return a + b.billable;
  }, 0);

  const today = new Date();
  const index = today.getDay() > 0 ? today.getDay() - 1 : 6;

  return {
    days: daily,
    total: {
      week: {
        milliseconds: sumDuration,
        billable: sumBillable,
      },
      today: {
        milliseconds: daily[index].milliseconds,
        billable: daily[index].billable,
      },
    },
  };
}

function computeDaySum(day, projects) {
  return new Promise(async (resolve) => {
    const yearFormatted = day.getFullYear();
    const monthFormatted = day.getMonth() + 1 < 10 ? `0${day.getMonth() + 1}` : `${day.getMonth() + 1}`;
    const dayFormatted = day.getDate() < 10 ? `0${day.getDate()}` : `${day.getDate()}`;

    const tasks = await idbKeyval.get(`tasks-${yearFormatted}-${monthFormatted}-${dayFormatted}`);

    if (!tasks || tasks.length <= 0) {
      resolve({
        day: day.getTime(),
        milliseconds: 0,
        billable: 0,
      });
      return;
    }

    const milliseconds = tasks.reduce((a, b) => {
      const diff = dayjs(b.data.to).diff(new Date(b.data.from));
      return a + diff;
    }, 0);

    const billable = tasks.reduce((a, b) => {
      const rate = projects[b.data.project_id];
      const milliseconds = dayjs(b.data.to).diff(new Date(b.data.from));

      const hours = milliseconds > 0 ? milliseconds / (1000 * 60 * 60) : 0;
      const sum = rate && rate.hourly > 0 ? hours * rate.hourly : 0;

      return a + sum;
    }, 0);

    resolve({
      day: day.getTime(),
      milliseconds: milliseconds,
      billable: billable,
    });
  });
}
