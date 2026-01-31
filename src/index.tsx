import {createRoot} from 'react-dom/client';
import App from './App';

import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import {rootReducer} from './store/reducers/index';

import {thunk} from 'redux-thunk'; // Changed import

import {
  applyPolyfills,
  defineCustomElements as colorDefineCustomElements,
  JSX as ColorJSX,
} from '@deckdeckgo/color/dist/loader';

import {setupIonicReact} from '@ionic/react';
import {DetailedHTMLProps, HTMLAttributes} from 'react';

type StencilProps<T> = {
  [P in keyof T]?: Omit<T[P], 'ref'> | HTMLAttributes<T>;
};

type ReactProps<T> = {
  [P in keyof T]?: DetailedHTMLProps<HTMLAttributes<T[P]>, T[P]>;
};

type AllStencilElements = ColorJSX.IntrinsicElements;

type StencilToReact<T = AllStencilElements, U = HTMLElementTagNameMap> = StencilProps<T> &
  ReactProps<U>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace JSX {
    interface IntrinsicElements extends StencilToReact {}
  }
}

applyPolyfills().then(async () => {
  await colorDefineCustomElements(window);
});

setupIonicReact({
  backButtonText: '',
});

// Safari 14 workaround 🤮
// https://github.com/jakearchibald/idb-keyval/issues/120
window.indexedDB.open('test');

const store = createStore(rootReducer, undefined, applyMiddleware(thunk));

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
