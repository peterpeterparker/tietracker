import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import {rootReducer} from './store/reducers/index';

import reduxThunk from 'redux-thunk';

import {defineCustomElements as chartsDefineCustomElements} from '@deckdeckgo/charts/dist/loader';
import {
  applyPolyfills,
  defineCustomElements as colorDefineCustomElements,
  JSX as LocalJSX,
} from '@deckdeckgo/color/dist/loader';

import {setupIonicReact} from '@ionic/react';
import {DetailedHTMLProps, HTMLAttributes} from 'react';

type StencilProps<T> = {
  [P in keyof T]?: Omit<T[P], 'ref'> | HTMLAttributes<T>;
};

type ReactProps<T> = {
  [P in keyof T]?: DetailedHTMLProps<HTMLAttributes<T[P]>, T[P]>;
};

type StencilToReact<T = LocalJSX.IntrinsicElements, U = HTMLElementTagNameMap> = StencilProps<T> &
  ReactProps<U>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace JSX {
    interface IntrinsicElements extends StencilToReact {}
  }
}

applyPolyfills().then(async () => {
  await colorDefineCustomElements(window);
  await chartsDefineCustomElements(window);
});

setupIonicReact({
  backButtonText: '',
});

// Safari 14 workaround 🤮
// https://github.com/jakearchibald/idb-keyval/issues/120
window.indexedDB.open('test');

const store = createStore(rootReducer, applyMiddleware(reduxThunk));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
