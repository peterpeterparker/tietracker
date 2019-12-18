importScripts('./libs/idb-keyval-iife.min.js');
importScripts('./libs/dayjs.min.js');

self.onmessage = async ($event) => {
    if ($event && $event.data === 'compute') {
        self.compute();
    }
};

self.compute = async () => {
    const promises = [];

    const today = new Date();

    promises.push(computeDayWorkedHours(today));

    if (today.getDay() > 1) {
        for (let i = 1; i < today.getDay(); i++) {
            promises.push(computeDayWorkedHours(dayjs().add(i * -1, 'day').toDate()));
        }
    }

    if (today.getDay() === 0) {
        promises.push(computeDayWorkedHours(dayjs().add(-6, 'day').toDate()));
    }

    const hours = await Promise.all(promises);

    if (!hours || hours.length <= 0) {
        self.postMessage({
            hours: 0
        });

        return;
    }

    const sum = hours.reduce((a, b) => {
        return a + b;
    }, 0);

    self.postMessage({
        hours: sum
    });
};

function computeDayWorkedHours(day) {
    return new Promise(async (resolve) => {
        const tasks = await idbKeyval.get(`tasks-${day.toISOString().substring(0, 10)}`);

        if (!tasks || tasks.length <= 0) {
            resolve(0);
            return;
        }

        const milliseconds = tasks.reduce((a, b) => {
            const diff = dayjs(b.data.to).diff(new Date(b.data.from));
            return a + diff;
        }, 0);

        resolve(milliseconds > 0 ? milliseconds / (1000 * 60 * 60) : 0);
    });
}
