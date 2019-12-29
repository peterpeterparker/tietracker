export function isChrome(): boolean {
    if (!window || !navigator) {
        return false;
    }

    const browser: string = navigator.userAgent || navigator.vendor || (window as any).opera;

    return /chrome/i.test(browser);
}
