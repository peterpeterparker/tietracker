import {setupIonicReact} from '@ionic/react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import {thunk} from 'redux-thunk'; // Changed import
import App from './App';
import {rootReducer} from './lib/store/reducers/index';

setupIonicReact({
  backButtonText: '',
  innerHTMLTemplatesEnabled: true,
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
