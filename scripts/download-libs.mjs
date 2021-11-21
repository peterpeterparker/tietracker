import {createWriteStream} from 'fs';
import {pipeline} from 'stream';
import {promisify} from 'util';
import fetch from 'node-fetch';

const download = async ({url, path}) => {
  const streamPipeline = promisify(pipeline);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`unexpected response ${response.url} ${response.statusText}`);
  }

  await streamPipeline(response.body, createWriteStream(path));
};

(async () => {
  try {
    await download({
      url: 'https://cdn.jsdelivr.net/npm/idb-keyval@latest/dist/umd.js',
      path: './public/workers/libs/idb-keyval.umd.js',
    });

    await download({
      url: 'https://unpkg.com/dayjs@latest/dayjs.min.js',
      path: './public/workers/libs/dayjs.min.js',
    });

    await download({
      url: 'https://unpkg.com/exceljs@latest/dist/exceljs.min.js',
      path: './public/workers/libs/exceljs.min.js',
    });

    await download({
      url: 'https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js',
      path: './public/workers/libs/jspdf.umd.min.js',
    });

    await download({
      url: 'https://raw.githubusercontent.com/Stuk/jszip/master/dist/jszip.min.js',
      path: './public/workers/libs/jszip.min.js',
    });
  } catch (err) {
    console.error(err);
  }
})();
