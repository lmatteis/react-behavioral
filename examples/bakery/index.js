import 'regenerator-runtime/runtime';

import React from 'react';
import {
  Provider,
  connect,
  connectProps
} from '../../src/react-behavioral';

import Thermometer from 'react-thermometer-component';
const Log = connect(function*() {
  const style = {
    float: 'right',
    width: '200px',
    height: '160px',
    marginRight: '-200px',
    fontSize: '10px'
  };
  this.updateView(<textarea id="log" style={style} />);
  const log = [];

  while (true) {
    yield {
      wait: [() => true]
    };
    if (this.lastEvent().payload !== undefined) {
      log.push(
        `{ type: "${this.lastEvent().type}", payload: ${
          this.lastEvent().payload
        } }`
      );
    } else {
      log.push(`{ type: "${this.lastEvent().type}" }`);
    }

    this.updateView(
      <textarea
        id="log"
        style={style}
        value={log.join('\n')}
      />
    );
  }
});

function Dot(props) {
  return <span class="dot" {...props} />;
}
const FlickeringDot = connectProps(
  function*() {
    const { id } = this.props;
    while (true) {
      yield {
        wait: ['TURN_OVEN_ON']
      };
      yield { request: id + 'FIRST_FLICKER' };
      this.setProps(prevProps => ({
        style: {
          ...prevProps.style,
          background: '#7FFF00'
        }
      }));

      setTimeout(() => {
        this.request(id + 'SECOND_FLICKER');
      }, 2000);

      // THIRD_FLICKER happens before SECOND_FLICKER
      setTimeout(() => {
        this.request(id + 'THIRD_FLICKER');
      }, 1000);
    }
  },
  function*() {
    const { id } = this.props;
    while (true) {
      yield { wait: id + 'SECOND_FLICKER' };
      this.setProps(prevProps => ({
        style: {
          ...prevProps.style,
          background: 'red'
        }
      }));
    }
  },
  function*() {
    const { id } = this.props;
    while (true) {
      yield { wait: id + 'THIRD_FLICKER' };
      this.setProps(prevProps => ({
        style: {
          ...prevProps.style,
          background: '#7FFF00'
        }
      }));
    }
  },
  function*() {
    const { id } = this.props;
    while (true) {
      yield {
        wait: ['TURN_OVEN_OFF']
      };
      this.setProps(prevProps => ({
        style: {
          ...prevProps.style,
          background: '#bbb'
        }
      }));
      yield {
        block: [
          id + 'FIRST_FLICKER',
          id + 'SECOND_FLICKER',
          id + 'THIRD_FLICKER'
        ],
        wait: 'TURN_OVEN_ON'
      };
    }
  }
)(Dot);

function Oven({ id, onChange, children }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column'
      }}
    >
      <div
        style={{
          fontSize: '8px',
          marginBottom: '20px'
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
      {children || (
        <Dot id={id} style={{ marginTop: '30px' }} />
      )}
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
      <input type="text" />

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

const OnOff = connect(function*() {
  let checked = false;
  while (true) {
    this.updateView(
      <label>
        {checked ? 'On' : 'Off'}
        <input
          type="checkbox"
          name="checkbox"
          onChange={() =>
            checked
              ? this.request('TURN_OVEN_OFF')
              : this.request('TURN_OVEN_ON')
          }
          checked={checked}
        />
      </label>
    );
    yield {
      wait: ['TURN_OVEN_ON', 'TURN_OVEN_OFF']
    };
    checked = !checked;
  }
});

function Input(props) {
  return <input type="text" {...props} />;
}

const Display = connectProps(
  function*() {
    while (true) {
      yield {
        wait: ['TURN_OVEN_ON']
      };
      this.setProps({ style: { background: '#7FFF00' } });
      yield {
        wait: ['TURN_OVEN_OFF']
      };
      this.setProps({ style: { background: 'white' } });
    }
  },
  function*() {
    while (true) {
      yield {
        wait: ['TURN_OVEN_ON']
      };
      this.setProps({ value: 'Oven is ON' });
    }
  },
  function*() {
    while (true) {
      yield {
        wait: ['TURN_OVEN_OFF']
      };
      this.setProps({ value: '' });
    }
  }
)(Input);

function Bakery2({ children }) {
  return (
    <div>
      <Log />
      <div style={{ marginBottom: '20px' }}>
        <OnOff />
        <Display />
      </div>
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

function Bakery3({ children }) {
  return (
    <div>
      <Log />
      <div style={{ marginBottom: '20px' }}>
        <OnOff />
        <Display />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around'
        }}
      >
        <Oven id={1}>
          <FlickeringDot
            id={1}
            style={{ marginTop: '30px' }}
          />
        </Oven>
        <Oven id={2}>
          <FlickeringDot
            id={2}
            style={{ marginTop: '30px' }}
          />
        </Oven>
        <Oven id={3}>
          <FlickeringDot
            id={3}
            style={{ marginTop: '30px' }}
          />
        </Oven>
      </div>
    </div>
  );
}

function* stabilizeFlickering() {
  while (true) {
    yield {
      wait: event => event.type.match('FIRST_FLICKER')
    };
    yield {
      block: event => event.type.match('THIRD_FLICKER'),
      wait: event => event.type.match('SECOND_FLICKER')
    };
    setTimeout(() => {
      this.request('TIMER');
    }, 1000);
    yield {
      block: event => event.type.match('THIRD_FLICKER'),
      wait: 'TIMER'
    };
  }
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
      do this we will mostly not have access to
      already-written code. Hence this will allow us to
      worry less about the readability or quality of our
      code, and more on the intended behavior.
    </p>
    <p>
      Here's how the app currently looks. It is entirely
      "dormant" at this stage made simply of stateless React
      components.
    </p>
    <Provider>
      <Bakery />
    </Provider>
    <p>
      The ovens panel UI is rather basic: there's an On/Off
      switch, a display for any information related to the
      oven, and finally the temperature of each oven. Below
      each oven temperature there's a warning light.
    </p>
    <p>
      Let's suppose Ms. B., the owner of the bakery, wants
      to add behavior to this UI and control and monitor the
      ovens in a way that she desires. The first thing she
      would like to happen is that whenever to "on" checkbox
      is checked, the background of the display should turn
      green. Moreover it should only display either On or
      Off based on whether the checkbox is selected. Let us
      do this using Behavioral Programming.
    </p>
    <Provider>
      <Bakery2 />
    </Provider>
    <p>
      Suppose that our user has just decided that when the
      switch is turned on, the three warning lights should
      flicker (by changing colors from green to red and
      back) three times, terminating in green.
    </p>
    <Provider threads={[stabilizeFlickering]}>
      <Bakery3 />
    </Provider>
  </React.Fragment>
);
