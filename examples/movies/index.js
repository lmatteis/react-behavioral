import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './index.css';
import threads from './threads';
import newThreads from './newThreads';

import { Provider } from '../../src/react-behavioral';

ReactDOM.render(
  <Provider threads={[...threads, ...newThreads]}>
    <App />
  </Provider>,
  document.getElementById('app')
);
