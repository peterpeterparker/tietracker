import {defineConfig} from '@junobuild/config';

export default defineConfig({
  satellite: {
    ids: {
      production: 'wnng7-ayaaa-aaaal-aswca-cai',
    },
    source: 'dist',
    predeploy: ['npm run build'],
    precompress: [
      {
        pattern: '**/*.+(js|mjs|css)',
        algorithm: 'brotli',
        mode: 'replace',
      },
      {
        pattern: '**/*.html',
        algorithm: 'brotli',
        mode: 'both',
      },
    ],
  },
});
