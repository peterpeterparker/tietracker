importScripts('./libs/idb-keyval-iife.min.js');
importScripts('./libs/dayjs.min.js');

importScripts('./utils/utils.js');

self.onmessage = async ($event) => {
    if ($event && $event.data && $event.data.msg === 'export') {
        await self.export($event.data.invoices, $event.data.projectId, $event.data.currency);
    }
};

self.export = async (invoices, filterProjectId, currency) => {
    if (!invoices || invoices.length <= 0) {
        self.postMessage(undefined);
        return;
    }

    const projects = await loadProjects();

    if (!projects || projects === undefined) {
        self.postMessage(undefined);
        return;
    }

    self.exportInvoices(invoices, projects, filterProjectId, currency);
};

async function exportInvoices(invoices, projects, filterProjectId, currency) {
    const promises = [];

    invoices.forEach((invoice) => {
        promises.push(exportInvoice(invoice, projects, filterProjectId, currency));
    });

    const results = await Promise.all(promises);

    if (!results || results.length <= 0) {
        self.postMessage(undefined);
        return;
    }

    const filteredResults = results.filter((tasks) => {
        return tasks && tasks !== undefined && tasks.length > 0;
    });

    if (!filteredResults || filteredResults.length <= 0) {
        self.postMessage(undefined);
        return;
    }

    const joined = filteredResults.reduce((a, b) => {
        return a + '\n' + b;
    });

    self.postMessage(joined);
}

function exportInvoice(invoice, projects, filterProjectId, currency) {
    return new Promise(async (resolve) => {
        const tasks = await idbKeyval.get(`tasks-${invoice}`);

        if (!tasks || tasks.length <= 0) {
            resolve(undefined);
            return;
        }

        // Only the tasks which are still not billed and which has to do with the selected project
        let filteredTasks = tasks.filter((task) => {
            return task.data.invoice.status === 'open' && task.data.project_id === filterProjectId;
        });

        if (!filteredTasks || filteredTasks.length <= 0) {
            resolve(undefined);
            return;
        }

        const results = [];

        filteredTasks.forEach((task) => {
            let line = task.data.description ? task.data.description : '';
            line += ',';

            line += dayjs(task.data.from).format('YYYY-MM-DD');
            line += ',';

            line += dayjs(task.data.from).format('HH:mm:ss');
            line += ',';

            line += dayjs(task.data.to).format('YYYY-MM-DD');
            line += ',';

            line += dayjs(task.data.to).format('HH:mm:ss');
            line += ',';

            const milliseconds = dayjs(task.data.to).diff(new Date(task.data.from));
            const hours = milliseconds > 0 ? milliseconds / (1000 * 60 * 60) : 0;

            line += `${hours}`;
            line += ',';

            const rate = projects[task.data.project_id].rate;
            const billable = rate && rate.hourly > 0 ? hours * rate.hourly : 0;

            line += `${billable}${currency ? ' ' + currency : ''}`;

            results.push(line);
        });

        if (!results || results.length <= 0) {
            resolve(undefined);
            return;
        }

        const joined = results.reduce((a, b) => {
            return a + '\n' + b;
        });

        resolve(joined);
    });
}
