import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import threads from './threads';

import { Provider } from '../../src/react-behavioral';

ReactDOM.render(
  <Provider threads={[...threads]}>
    <App />
  </Provider>,
  document.getElementById('root')
);
