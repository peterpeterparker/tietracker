const {createWriteStream} = require('fs');
const {pipeline} = require('stream');
const {promisify} = require('util');
const fetch = require('node-fetch');

const download = async ({url, path}) => {
  const streamPipeline = promisify(pipeline);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`unexpected response ${response.statusText}`);
  }

  await streamPipeline(response.body, createWriteStream(path));
};

(async () => {
  try {
    await download({
      url: 'https://raw.githubusercontent.com/jakearchibald/idb-keyval/master/dist/iife/index-min.js',
      path: './public/workers/libs/idb-keyval-iife.min.js',
    });
  } catch (err) {
    console.error(err);
  }
})();
