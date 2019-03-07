import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './index.css';

import { Provider } from '../../src/react-behavioral';

function* log() {
  while (true) {
    yield { wait: () => true };
    console.log(this.lastEvent());
  }
}

const cache = {};
function* cacheFetchMovieDetails() {
  while (true) {
    yield { wait: 'CLICKED_MOVIE' };
    const clickedMovieId = this.lastEvent().payload;
    yield { wait: 'mountedMoviePage' };

    if (cache[clickedMovieId]) {
      yield {
        block: 'fetchMovieDetails',
        wait: 'CLICKED_BACK'
      };
    } else {
      yield { wait: 'fetchMovieDetailsSuccess' };
      const details = this.lastEvent().payload;
      cache[details.id] = details;
    }
  }
}

function* foo() {
  while (true) {
    yield { wait: 'CLICKED_MOVIE' };
    const clickedMovieId = this.lastEvent().payload;
    yield { wait: 'mountedMoviePage' };

    if (cache[clickedMovieId]) {
      yield {
        request: {
          type: 'fetchMovieDetailsSuccess',
          payload: cache[clickedMovieId]
        }
      };
    }
  }
}

ReactDOM.render(
  <Provider threads={[log]}>
    <App />
  </Provider>,
  document.getElementById('app')
);
