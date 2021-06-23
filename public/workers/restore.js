importScripts('./libs/jszip.min.js');

self.onmessage = async ($event) => {
  if ($event && $event.data && $event.data.msg === 'restore-idb') {
    await self.restoreIdb($event.data.zip);
  }
};

self.restoreIdb = async (data) => {
  const zip = new JSZip();

  const contents = await zip.loadAsync(data);

  Object.keys(contents.files).forEach((filename) => {
    zip
      .file(filename)
      .async('text')
      .then((content) => {
        console.log(filename, content);
      });
  });
};
