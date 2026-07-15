export const isTest = (): boolean => JSON.parse(import.meta.env.VITE_E2E ?? 'false') === true;

export const isNotTest = (): boolean => !isTest();
