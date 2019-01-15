import 'regenerator-runtime/runtime';

import React from 'react';

import Thermometer from 'react-thermometer-component';

function Oven({ id, onChange }) {
  return (
    <div>
      <div
        style={{
          fontSize: '8px'
        }}
      >
        <input
          type="radio"
          name={id}
          value="off"
          onChange={onChange}
          checked
        />{' '}
        Off
        <input
          type="radio"
          name={id}
          value="medium"
          onChange={onChange}
        />{' '}
        Medium
        <input
          type="radio"
          name={id}
          value="high"
          onChange={onChange}
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
    <div>
      <label>
        On/Off<input
          type="checkbox"
          name="checkbox"
          value="value"
        />
      </label>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around'
        }}
      >
        <Oven id={1} />
        <Oven id={2} />
        <Oven id={3} />
      </div>
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
      Behavioral Programming is a paradigm that allows us to
      program in a way that is aligned with requirements.
      Moreover it is incremental in nature, where newly
      added code can modify how old code behaves. Because of
      this we can add features and change the system at hand
      without having to see or care about how old code is
      implemented. This is why I decided to explain this
      paradigm in a way which I call "append-only
      development". For more info on the details of how
      Behavioral Programming works please check the{' '}
      <a href="/">TicTacToe example</a>.
    </p>
    <p>
      We will start with a basic app, and slowly add
      behavior to it and change how it works. Every time we
      do this we will never have access to already-written
      code.
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
