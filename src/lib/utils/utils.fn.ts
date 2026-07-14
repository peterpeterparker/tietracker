export type Result<T> = {status: 'success'; result: T} | {status: 'error'; err: unknown};

export const safeExec = async <T>(fn: () => Promise<T>): Promise<Result<T>> => {
  try {
    const result = await fn();
    return {status: 'success', result};
  } catch (err: unknown) {
    return {status: 'error', err};
  }
};
