interface ChooseFileSystemEntriesOptionsAccepts {
  description: string;
  mimeTypes: string[];
  extensions: string[];
}

interface ChooseFileSystemEntriesOptions {
  type: 'open-file' | 'save-file' | 'open-directory';
  accepts: ChooseFileSystemEntriesOptionsAccepts[];
}

interface FileSystemHandle {
  readonly isFile: boolean;
  readonly isDirectory: boolean;
  readonly name: string;
}

interface FileSystemFileHandle extends FileSystemHandle {
  getFile(): Promisey<File>;
  createWritable(): Promise<FileSystemWriter>;
}

function chooseFileSystemEntries(opts: ChooseFileSystemEntriesOptions): Promise<FileSystemFileHandle>;
