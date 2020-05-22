import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import {rootReducer} from './store/reducers/index';

import reduxThunk from 'redux-thunk';

import {applyPolyfills, defineCustomElements as colorDefineCustomElements, JSX as LocalJSX} from '@deckdeckgo/color/dist/loader';
import {defineCustomElements as chartsDefineCustomElements} from '@deckdeckgo/charts/dist/loader';

import {DetailedHTMLProps, HTMLAttributes} from 'react';

type StencilProps<T> = {
  [P in keyof T]?: Omit<T[P], 'ref'> | HTMLAttributes<T>;
};

type ReactProps<T> = {
  [P in keyof T]?: DetailedHTMLProps<HTMLAttributes<T[P]>, T[P]>;
};

type StencilToReact<T = LocalJSX.IntrinsicElements, U = HTMLElementTagNameMap> = StencilProps<T> & ReactProps<U>;

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

const store = createStore(rootReducer, applyMiddleware(reduxThunk));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
