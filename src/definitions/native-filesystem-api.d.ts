interface ChooseFileSystemEntriesOptionsAccepts {
  description: string;
  mimeTypes: string[];
  extensions: string[];
}

interface ChooseFileSystemEntriesOptions {
  type: 'openFile' | 'saveFile' | 'openDirectory';
  accepts: ChooseFileSystemEntriesOptionsAccepts[];
}

interface FileSystemHandle {
  readonly isFile: boolean;
  readonly isDirectory: boolean;
  readonly name: string;
}

interface FileSystemFileHandle extends FileSystemHandle {
  getFile(): Promisey<File>;
  createWriter(): Promise<FileSystemWriter>;
}

function chooseFileSystemEntries(opts: ChooseFileSystemEntriesOptions): Promise<FileSystemFileHandle>;
