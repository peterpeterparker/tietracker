export const emit = <T>({message, detail}: {message: string; detail?: T | undefined}) => {
  const $event: CustomEvent<T> = new CustomEvent<T>(message, {detail, bubbles: true});
  document.dispatchEvent($event);
};

export const emitError = (error: string | Error | unknown) =>
  emit<string>({
    message: 'tieError',
    detail:
      typeof error === 'string' ? error : error instanceof Error ? error.message : 'Unknown error',
  });
