import 'regenerator-runtime/runtime';

import React from 'react';

import shoppingGif from './shopping.gif';

function Box({ children }) {
  return (
    <div
      style={{
        width: '700px',
        marginLeft: '-100px'
      }}
    >
      {children}
    </div>
  );
}

export default () => (
  <React.Fragment>
    <h2>
      Behavioral Programming: an interactive essay on the
      development lifecycle of a shopping application
    </h2>
    <pre>
      <a href="https://twitter.com/lmatteis">
        Luca Matteis
      </a>
    </pre>

    <p>
      In this interactive essay we will be building a rather
      complicated shopping application using a library I
      called{' '}
      <a href="https://github.com/lmatteis/react-behavioral">
        react-behavioral
      </a>.
    </p>
    <p>
      If you haven't already seen the{' '}
      <a href="/">TicTacToe example</a> built with
      react-behavioral and showcasing how Behavioral
      Programming works more in detail, I suggest you check
      it out.
    </p>
    <p>
      Rather than concentrating on various aspects of the
      app we will focus all our attention on the behavior:
      when I click this button, this should appear and these
      3 other things should happen which in turn also make
      this other thing happen.
    </p>
    <p>Here's how the shopping app looks like:</p>
    <p>
      <Box>
        <img src={shoppingGif} />
      </Box>
    </p>
  </React.Fragment>
);
