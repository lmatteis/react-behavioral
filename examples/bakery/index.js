import 'regenerator-runtime/runtime';

import React from 'react';

import Thermometer from 'react-thermometer-component';

function Oven() {
  return (
    <div>
      <div style={{ fontSize: '8px' }}>
        <input type="radio" name="switch" value="off" /> Off
        <input
          type="radio"
          name="switch"
          value="medium"
        />{' '}
        Medium
        <input
          type="radio"
          name="switch"
          value="high"
        />{' '}
        High
      </div>
      <Thermometer
        theme="light"
        value="18"
        max="100"
        steps="3"
        format="°C"
        size="large"
        height="300"
      />
    </div>
  );
}

function Bakery({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <Oven />
      <Oven />
      <Oven />
    </div>
  );
}

export default () => (
  <React.Fragment>
    <h2>Append-only development with React</h2>
    <pre>
      <a href="https://twitter.com/lmatteis">
        Luca Matteis
      </a>
    </pre>

    <p>
      In this interactive essay we will be building an app
      that controls and monitors 3 different ovens. We will
      be building it using a paradigm called Behavioral
      Programming which is implemented using the{' '}
      <a href="https://github.com/lmatteis/react-behavioral">
        react-behavioral
      </a>{' '}
      library.
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
    <p>
      Here's how the app currently looks. It's entirely
      "dormant" at this stage made simply of stateless React
      components.
    </p>
    <p>
      <Bakery />
    </p>
  </React.Fragment>
);
