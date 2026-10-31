import {DirectoryEntry, File} from '@awesome-cordova-plugins/file';
import {SocialSharing} from '@awesome-cordova-plugins/social-sharing';
import {isPlatform} from '@ionic/react';
import {nonNullish} from './utils.nullish';

export async function getNewFileHandle(type: 'xlsx' | 'zip'): Promise<FileSystemFileHandle> {
  const xlsxOpts: SaveFilePickerOptions = {
    types: [
      {
        description: 'Excel Files',
        accept: {
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        },
      },
    ],
  };

  const zipOpts: SaveFilePickerOptions = {
    types: [
      {
        description: 'Zip Files',
        accept: {
          'application/zip': ['.zip'],
        },
      },
    ],
  };

  return showSaveFilePicker(type === 'zip' ? zipOpts : xlsxOpts);
}

export async function writeFile(
  fileHandle: FileSystemFileHandle,
  contents: string | BufferSource | Blob,
) {
  // Create a writer (request permission if necessary).
  const writer = await fileHandle.createWritable();
  // Write the full length of the contents
  await writer.write(contents);
  // Close the file and write the contents to disk
  await writer.close();
}

export async function getMobileDir(): Promise<DirectoryEntry> {
  const rootDir: DirectoryEntry = await File.resolveDirectoryUrl(
    isPlatform('ios') ? File.syncedDataDirectory : File.dataDirectory,
  );

  return new Promise<DirectoryEntry>((resolve, reject) => {
    rootDir.getDirectory(
      'tietracker',
      {create: true},
      (newDir: DirectoryEntry) => {
        resolve(newDir);
      },
      (_err) => {
        reject(new Error('Directory not found or not created.'));
      },
    );
  });
}

export async function shareMobile(subject: string, path: string, filename: string): Promise<void> {
  await SocialSharing.shareWithOptions({
    subject,
    files: [`${path}/${filename}`],
    chooserTitle: 'Pick an app',
  });
}

// https://stackoverflow.com/a/19328891/5404186
export function download(filename: string, blob: Blob) {
  const a: HTMLAnchorElement = document.createElement('a');
  a.style.display = 'none';
  document.body.appendChild(a);

  const url = window.URL.createObjectURL(blob);

  a.href = url;
  a.download = filename;

  a.click();

  window.URL.revokeObjectURL(url);

  if (nonNullish(a) && nonNullish(a.parentElement)) {
    a.parentElement.removeChild(a);
  }
}
