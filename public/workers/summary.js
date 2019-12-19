importScripts('./libs/idb-keyval-iife.min.js');
importScripts('./libs/dayjs.min.js');

self.onmessage = async ($event) => {
    if ($event && $event.data === 'compute') {
        self.compute();
    }
};

self.compute = async () => {
    const projects = await loadProjectsRate();

    if (!projects || projects === undefined) {
        self.postMessage({
            hours: 0,
            billable: 0
        });

        return;
    }

    const sum = await computeSum(projects);

    self.postMessage({
        hours: sum.hours,
        billable: sum.billable
    });
};

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

async function computeSum(projects) {
    const promises = [];

    const today = new Date();

    promises.push(computeDaySum(today, projects));

    if (today.getDay() > 1) {
        for (let i = 1; i < today.getDay(); i++) {
            promises.push(computeDaySum(dayjs().add(i * -1, 'day').toDate(), projects));
        }
    }

    if (today.getDay() === 0) {
        promises.push(computeDaySum(dayjs().add(-6, 'day').toDate()), projects);
    }

    const daily = await Promise.all(promises);

    if (!daily || daily.length <= 0) {
        self.postMessage({
            hours: 0,
            billable: 0
        });

        return;
    }

    const sumHours = daily.reduce((a, b) => {
        return a + b.hours;
    }, 0);

    const sumBillable = daily.reduce((a, b) => {
        return a + b.billable;
    }, 0);

    return {
        hours: Math.round(sumHours * 100) / 100,
        billable: Math.round(sumBillable * 100) / 100
    };
}

function computeDaySum(day, projects) {
    return new Promise(async (resolve) => {
        const tasks = await idbKeyval.get(`tasks-${day.toISOString().substring(0, 10)}`);

        if (!tasks || tasks.length <= 0) {
            resolve({
                hours: 0,
                billable: 0
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
            hours: milliseconds > 0 ? milliseconds / (1000 * 60 * 60) : 0,
            billable: billable
        });
    });
}
