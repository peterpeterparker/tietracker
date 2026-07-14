export const isTest = (): boolean => JSON.parse(import.meta.env.VITE_E2E ?? "false") === true;


console.log(import.meta.env, isTest());