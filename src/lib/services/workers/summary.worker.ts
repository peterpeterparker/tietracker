import {differenceInMilliseconds} from 'date-fns';
import {Summary, SummaryDay} from '../../store/interfaces/summary';
import {Project, ProjectDataRate, ProjectId} from '../../types/project';
import {Task} from '../../types/task';
import {isNullish} from '../../utils/utils.nullish';
import {KeyedIdbStorage} from '../storages/idb.storage';

const EMPTY_SUMMARY: Summary = {
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
};

export const computeSummary = async ({days}: {days: Date[]}): Promise<Summary> => {
  const projects = await loadProjectsRate();

  if (isNullish(projects)) {
    return EMPTY_SUMMARY;
  }

  return await computeSum({projects, days});
};

type ProjectsRate = Record<ProjectId, ProjectDataRate>;

const loadProjectsRate = async (): Promise<Option<ProjectsRate>> => {
  const storage = new KeyedIdbStorage<Project[]>({key: 'projects'});
  const projects = await storage.get();

  if (isNullish(projects) || projects.length <= 0) {
    return undefined;
  }

  const result: Record<ProjectId, ProjectDataRate> = {};
  projects.forEach((project) => {
    result[project.id] = project.data.rate ? project.data.rate : {hourly: 0, vat: false};
  });

  return result;
};

const computeSum = async ({
  days,
  projects,
}: {
  projects: ProjectsRate;
  days: Date[];
}): Promise<Summary> => {
  const promises = days.map((day) => {
    return computeDaySum({day, projects});
  });

  const daily = await Promise.all(promises);

  if (isNullish(daily) || daily.length <= 0) {
    return EMPTY_SUMMARY;
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
};

const computeDaySum = async ({
  day,
  projects,
}: {
  projects: ProjectsRate;
  day: Date;
}): Promise<SummaryDay> => {
  const yearFormatted = day.getFullYear();
  const monthFormatted =
    day.getMonth() + 1 < 10 ? `0${day.getMonth() + 1}` : `${day.getMonth() + 1}`;
  const dayFormatted = day.getDate() < 10 ? `0${day.getDate()}` : `${day.getDate()}`;

  const storage = new KeyedIdbStorage<Task[]>({
    key: `tasks-${yearFormatted}-${monthFormatted}-${dayFormatted}`,
  });
  const tasks = await storage.get();

  if (isNullish(tasks) || tasks.length <= 0) {
    return {
      day: day.getTime(),
      milliseconds: 0,
      billable: 0,
    };
  }

  const milliseconds = tasks.reduce((a, b) => {
    const diff = differenceInMilliseconds(new Date(b.data.to ?? Date.now()), new Date(b.data.from));
    return a + diff;
  }, 0);

  const billable = tasks.reduce((a, b) => {
    const rate = projects[b.data.project_id];
    const milliseconds = differenceInMilliseconds(
      new Date(b.data.to ?? Date.now()),
      new Date(b.data.from),
    );

    const hours = milliseconds > 0 ? milliseconds / (1000 * 60 * 60) : 0;
    const sum = rate && rate.hourly > 0 ? hours * rate.hourly : 0;

    return a + sum;
  }, 0);

  return {
    day: day.getTime(),
    milliseconds: milliseconds,
    billable: billable,
  };
};
