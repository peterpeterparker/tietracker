import {readFileSync, writeFileSync} from 'fs';

// Issue: https://github.com/katzer/cordova-plugin-badge/issues/152#issuecomment-1238373550
const deprecated = 'compile "me.leolin:ShortcutBadger:${appShortcutBadgerVersion}@aar"';
const valid = 'implementation "me.leolin:ShortcutBadger:${appShortcutBadgerVersion}@aar"';

const files = [
  'node_modules/cordova-plugin-badge/src/android/badge.gradle',
  'node_modules/cordova-plugin-local-notification/src/android/build/localnotification.gradle',
];

files.forEach((file) => {
  const gradle = readFileSync(file, 'utf-8');
  writeFileSync(file, gradle.replace(deprecated, valid), 'utf-8');
});
