export function isChrome(): boolean {
  if (!window || !navigator) {
    return false;
  }

  const browser: string = navigator.userAgent || navigator.vendor || (window as any).opera;

  return /chrome/i.test(browser);
}

export function isHttps(): boolean {
  if (!document || !document.location || !document.location.protocol) {
    return false;
  }

  return document.location.protocol.indexOf('https') > -1;
}
