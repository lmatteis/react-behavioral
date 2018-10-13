import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';

import TicTacToeGame from './examples/tic-tac-toe';
import Shopping from './examples/shopping/index';

ReactDOM.render(
  <React.Fragment>
    {window.location.pathname === '/shopping' ? (
      <Shopping />
    ) : (
      <TicTacToeGame />
    )}
  </React.Fragment>,
  document.getElementById('content')
);
