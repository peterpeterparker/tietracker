importScripts('./libs/idb-keyval-iife.min.js');
importScripts('./libs/jszip.min.js');

self.onmessage = async ($event) => {
  if ($event && $event.data && $event.data.msg === 'restore-idb') {
    await self.cleanIdb();
    await self.restoreIdb($event.data.zip);
  }
};

self.restoreIdb = async (data) => {
  const zip = new JSZip();

  const contents = await zip.loadAsync(data);

  const files = Object.keys(contents.files);

  const dbKeysData = [];
  for (const filename of files) {
    const content = await zip.file(filename).async('text');
    dbKeysData.push([filename.replace('.json', ''), filename === 'backup.json' ? Date.parse(JSON.parse(content)) : JSON.parse(content)]);
  }

  await idbKeyval.setMany(dbKeysData);
};

async function cleanIdb() {
  await idbKeyval.clear();
}
