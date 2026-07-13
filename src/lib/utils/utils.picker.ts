export function pickerColor(color: string | undefined, background: string | undefined) {
  if (!document) {
    return;
  }

  const pickerDialog: HTMLElement | null = document.querySelector('body');

  if (pickerDialog) {
    if (background !== undefined) {
      pickerDialog.style.setProperty('--picker-background', background);
    } else {
      pickerDialog.style.removeProperty('--picker-background');
    }

    if (color !== undefined) {
      pickerDialog.style.setProperty('--picker-color', color);
    } else {
      pickerDialog.style.removeProperty('--picker-color');
    }
  }
}
