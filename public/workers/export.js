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
    for (let i = 0; i < invoices.length; i++) {
        await exportInvoice(invoices[i], projects, filterProjectId, currency);
    }

    // Notify end
    self.postMessage(undefined);
}

function exportInvoice(invoice, projects, filterProjectId, currency) {
    return new Promise(async (resolve) => {
        const tasks = await idbKeyval.get(`tasks-${invoice}`);

        if (!tasks || tasks.length <= 0) {
            resolve();
            return;
        }

        // Only the tasks which are still not billed and which has to do with the selected project
        let filteredTasks = tasks.filter((task) => {
            return task.data.invoice.status === 'open' && task.data.project_id === filterProjectId;
        });

        if (!filteredTasks || filteredTasks.length <= 0) {
            resolve();
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
            resolve();
            return;
        }

        const joined = results.reduce((a, b) => {
            return a + '\n' + b;
        });

        if (joined !== undefined && joined.length > 0) {
            self.postMessage(joined);
        }

        resolve();
    });
}
