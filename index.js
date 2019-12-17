import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';

import TicTacToeGame from './examples/tic-tac-toe';
import Bakery from './examples/bakery/index';
import BakeryComplex from './examples/bakery/bakery';

ReactDOM.render(
  <React.Fragment>
    <TicTacToeGame />
  </React.Fragment>,
  document.getElementById('content')
);
