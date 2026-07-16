export const CLIENT_COLOR_FALLBACK = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

export const KEYS = {
  preferences: {
    backup: 'backup',
    theme: 'dark_mode',
    settings: 'settings',
    migrateIdbToFilesystem: 'migrate-idb-to-filesystem',
  },
  filesystem: {
    clients: 'clients',
    invoices: 'invoices',
    projects: 'projects',
    taskInProgress: 'task-in-progress',
  },
};

export const PREFERENCES_KEYS = Object.values(KEYS.preferences);
