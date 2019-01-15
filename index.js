import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';

import TicTacToeGame from './examples/tic-tac-toe';
import Bakery from './examples/bakery/index';

ReactDOM.render(
  <React.Fragment>
    {window.location.pathname === '/bakery' ? (
      <Bakery />
    ) : (
      <TicTacToeGame />
    )}
  </React.Fragment>,
  document.getElementById('content')
);
