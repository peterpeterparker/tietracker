export const emit = <T>({message, detail}: {message: string; detail?: T | undefined}) => {
  const $event: CustomEvent<T> = new CustomEvent<T>(message, {detail, bubbles: true});
  document.dispatchEvent($event);
};

export const emitError = (error: string) => emit<string>({message: 'tieError', detail: error});
