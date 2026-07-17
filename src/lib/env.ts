import {Capacitor} from '@capacitor/core';

export const isTest = (): boolean => JSON.parse(import.meta.env.VITE_E2E ?? 'false') === true;

export const isNotTest = (): boolean => !isTest();

export const isNotNativePlatform = (): boolean => !Capacitor.isNativePlatform();

export const isSafari = (): boolean => /apple/i.test(navigator.vendor);