import 'regenerator-runtime/runtime';

import React from 'react';
import {
  Provider,
  connect,
  connectProps
} from '../../src/react-behavioral';

import Thermometer from './Thermometer';
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
      yield { wait: 'RED_LIGHT' };
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
      yield { wait: 'GREEN_LIGHT' };
      this.setProps(prevProps => ({
        style: {
          ...prevProps.style,
          background: '#7FFF00'
        }
      }));
    }
  },
  function*() {
    while (true) {
      yield { wait: 'OFF_LIGHT' };
      this.setProps(prevProps => ({
        style: {
          ...prevProps.style,
          background: '#bbb'
        }
      }));
    }
  }
)(Dot);

function Input(props) {
  return <input {...props} />;
}
const Radio = connectProps(
  function*() {
    this.setProps({
      type: 'radio',
      value: this.props.value,
      onChange: () => {
        this.request(this.props.id + 'CLEAR_RADIOS');

        this.request({
          type: this.props.id + '_SET_' + this.props.value,
          payload: this.props.value
        });
      },
      checked: this.props.value === 'off'
    });
  },
  function*() {
    while (true) {
      yield {
        wait: event =>
          event.type ===
          this.props.id + '_SET_' + this.props.value
      };
      const payload = this.lastEvent().payload;
      this.setProps({
        checked: this.props.value === payload
      });
    }
  },
  function*() {
    while (true) {
      yield {
        wait: this.props.id + 'CLEAR_RADIOS'
      };
      console.log('false');
      this.setProps({ checked: false });
    }
  }
)(Input);

class RadioBoxes extends React.Component {
  state = { selectedOption: 'off' };
  handleChange = event => {
    this.props.onChange(event.target.value);
  };
  render() {
    return (
      <div
        style={{
          fontSize: '8px',
          marginBottom: '20px'
        }}
      >
        <label>
          <input
            type="radio"
            value="off"
            checked={this.props.selectedOption === 'off'}
            onChange={this.handleChange}
          />
          Off
        </label>
        <label>
          <input
            type="radio"
            value="medium"
            checked={this.props.selectedOption === 'medium'}
            onChange={this.handleChange}
          />
          Medium
        </label>
        <label>
          <input
            type="radio"
            value="high"
            checked={this.props.selectedOption === 'high'}
            onChange={this.handleChange}
          />
          High
        </label>
      </div>
    );
  }
}

const RadioBoxesContainer = connectProps(
  function*() {
    this.setProps({
      selectedOption: 'off',
      onChange: value =>
        this.request({
          type: this.props.id + '_SET_TEMPERATURE',
          payload: value
        })
    });
  },
  function*() {
    while (true) {
      yield {
        wait: this.props.id + '_SET_TEMPERATURE'
      };
      this.setProps({
        selectedOption: this.lastEvent().payload
      });
    }
  }
)(RadioBoxes);

function* whenOvenIsOnStartInterval() {
  while (true) {
    yield {
      wait: 'TURN_OVEN_ON'
    };

    // start an interval
    const interval = setInterval(() => {
      this.request('INTERVAL');
    }, 500);

    yield {
      wait: 'TURN_OVEN_OFF'
    };
    yield {
      request: 'CLEAR_INTERVAL'
    };
    clearInterval(interval);
  }
}

function* clear() {}

const ThermometerContainer = connectProps(
  function* increaseTemp() {
    while (true) {
      yield {
        wait: 'INTERVAL'
      };
      yield {
        request: this.props.id + '_INCREASE_TEMP'
      };
    }
  },
  function*() {
    yield {
      block: this.props.id + '_INCREASE_TEMP',
      wait: event =>
        event.type === this.props.id + '_SET_TEMPERATURE' &&
        (event.payload === 'high' ||
          event.payload === 'medium')
    };
    while (true) {
      yield {
        wait: event =>
          event.type ===
            this.props.id + '_SET_TEMPERATURE' &&
          event.payload === 'off'
      };
      yield {
        block: this.props.id + '_INCREASE_TEMP',
        wait: event =>
          event.type ===
            this.props.id + '_SET_TEMPERATURE' &&
          event.payload !== 'off'
      };
    }
  },
  function*() {
    yield {
      block: this.props.id + '_DECREASE_TEMP',
      wait: event =>
        event.type === this.props.id + '_SET_TEMPERATURE' &&
        (event.payload === 'off' ||
          event.payload === 'medium')
    };
    while (true) {
      yield {
        wait: event =>
          event.type ===
            this.props.id + '_SET_TEMPERATURE' &&
          event.payload === 'high'
      };
      yield {
        block: this.props.id + '_DECREASE_TEMP',
        wait: event =>
          event.type ===
            this.props.id + '_SET_TEMPERATURE' &&
          event.payload !== 'high'
      };
    }
  },
  // function* stopWhen100() {
  //   while (true) {
  //     yield {
  //       wait: this.props.id + '_INCREASE_TEMP'
  //     };
  //     if (this.state.value === 100) {
  //       yield {
  //         block: this.props.id + '_INCREASE_TEMP',
  //         wait: this.props.id + '_DECREASE_TEMP'
  //       };
  //     }
  //   }
  // },
  function* whenOffDecrease() {
    while (true) {
      yield {
        wait: 'INTERVAL'
      };
      yield {
        request: this.props.id + '_DECREASE_TEMP'
      };
    }
  },
  function* stop() {
    let count = 0;
    const { id } = this.props;
    while (true) {
      yield {
        wait: [id + '_DECREASE_TEMP', id + '_INCREASE_TEMP']
      };
      const { type } = this.lastEvent();

      if (type === id + '_INCREASE_TEMP') {
        count = count + 5;
      } else if (type === id + '_DECREASE_TEMP') {
        count = count - 5;
      }
      if (count <= 0) {
        yield {
          block: this.props.id + '_DECREASE_TEMP',
          wait: this.props.id + '_INCREASE_TEMP'
        };
        count = count + 5;
      } else if (count === 100) {
        yield {
          block: this.props.id + '_INCREASE_TEMP',
          wait: this.props.id + '_DECREASE_TEMP'
        };
        count = count - 5;
      }
    }
  },
  function* whenMediumTryToReachHalf() {
    const medium = event =>
      event.type === this.props.id + '_SET_TEMPERATURE' &&
      event.payload === 'medium';

    const setTemperature =
      this.props.id + '_SET_TEMPERATURE';

    while (true) {
      yield { wait: medium };
      while (true) {
        if (this.state.value > 50) {
          yield {
            block: [this.props.id + '_INCREASE_TEMP'],
            wait: [setTemperature, 'INTERVAL']
          };
        } else if (
          this.state.value < 50 ||
          this.state.value === 0
        ) {
          yield {
            block: [this.props.id + '_DECREASE_TEMP'],
            wait: [setTemperature, 'INTERVAL']
          };
        } else {
          yield {
            block: [
              this.props.id + '_INCREASE_TEMP',
              this.props.id + '_DECREASE_TEMP'
            ],
            wait: [setTemperature, 'INTERVAL']
          };
        }
        if (
          this.lastEvent().type === setTemperature &&
          this.lastEvent().payload !== 'medium'
        ) {
          break;
        }
      }
    }
  },
  [
    0.5,
    function* whenOffBlockSetTemperature() {
      yield {
        block: event =>
          event.type ===
            this.props.id + '_SET_TEMPERATURE' &&
          event.payload !== 'off',
        wait: 'TURN_OVEN_ON'
      };
      yield {
        request: {
          type: this.props.id + '_SET_TEMPERATURE',
          payload: 'off'
        }
      };

      while (true) {
        yield {
          wait: 'TURN_OVEN_OFF'
        };
        yield {
          block: event =>
            event.type ===
              this.props.id + '_SET_TEMPERATURE' &&
            event.payload !== 'off',
          wait: 'TURN_OVEN_ON'
        };
        yield {
          request: {
            type: this.props.id + '_SET_TEMPERATURE',
            payload: 'off'
          }
        };
      }
    }
  ],
  function* UI() {
    while (true) {
      yield {
        wait: this.props.id + '_INCREASE_TEMP'
      };
      this.setProps(prevProps => ({
        ...prevProps,
        value: Number(prevProps.value) + 5
      }));
    }
  },
  function* UI2() {
    while (true) {
      yield {
        wait: this.props.id + '_DECREASE_TEMP'
      };
      this.setProps(prevProps => ({
        ...prevProps,
        value: Number(prevProps.value) - 5
      }));
    }
  },
  function* whenOvenOffSetTemperatureOff() {
    while (true) {
      yield { wait: 'TURN_OVEN_OFF' };
      yield {
        request: {
          type: this.props.id + '_SET_TEMPERATURE',
          payload: 'off'
        }
      };
    }
  },
  function* clear() {
    // clear interval only after all ovens are back to 0
    while (true) {
      yield {
        wait: 'TURN_OVEN_OFF'
      };
      if (this.state.value > 0) {
        yield {
          block: 'CLEAR_INTERVAL',
          wait: this.props.id + '_OVEN_ZERO'
        };
      }
    }
  },
  function*() {
    while (true) {
      yield {
        wait: this.props.id + '_DECREASE_TEMP'
      };
      if (this.state.value <= 0) {
        yield {
          request: this.props.id + '_OVEN_ZERO'
        };
      }
    }
  }
  // function*() {
  //   while (true) {
  //     yield { wait: 'TURN_OVEN_OFF' };
  //     yield {
  //       block: this.props.id + '_INCREASE_TEMP',
  //       wait: this.props.id + '_OVEN_ZERO'
  //     };
  //   }
  // }
)(Thermometer);

function Oven({ id, children }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column'
      }}
    >
      <RadioBoxesContainer id={id} />

      <ThermometerContainer
        theme="light"
        value="0"
        max="100"
        steps="3"
        format="°C"
        size="large"
        height="300"
        id={id}
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

const lights = [
  function*() {
    const { id } = this.props;
    while (true) {
      yield {
        wait: ['TURN_OVEN_OFF']
      };
      yield { request: 'OFF_LIGHT' };
      yield {
        block: ['GREEN_LIGHT', 'RED_LIGHT'],
        wait: 'TURN_OVEN_ON'
      };
    }
  },
  function*() {
    const { id } = this.props;
    while (true) {
      yield {
        wait: ['TURN_OVEN_ON']
      };
      yield { request: 'GREEN_LIGHT' };

      let timeout = 0;
      for (var i = 0; i < 3; i++) {
        timeout += 200;
        setTimeout(() => {
          this.bSync({
            request: 'RED_LIGHT',
            wait: 'TURN_OVEN_ON'
          });
        }, timeout);

        timeout += 200;
        setTimeout(() => {
          this.bSync({
            request: 'GREEN_LIGHT',
            wait: 'TURN_OVEN_ON'
          });
        }, timeout);
      }
    }
  }
];

const neverDecreaseTempUnlessItWasIncreasedFirst = [
  function*() {
    yield {
      block: '1_DECREASE_TEMP',
      wait: '1_INCREASE_TEMP'
    };
  },
  function*() {
    yield {
      block: '2_DECREASE_TEMP',
      wait: '2_INCREASE_TEMP'
    };
  },
  function*() {
    yield {
      block: '3_DECREASE_TEMP',
      wait: '3_INCREASE_TEMP'
    };
  }
];

const blockQuickSuccessionIncreaseDecrease = [
  function*() {
    while (true) {
      yield {
        wait: '1_INCREASE_TEMP'
      };

      setTimeout(() => {
        this.request('500_MS_ELAPSED');
      }, 500);

      // block another other increase until 500ms have elapsed
      yield {
        block: '1_INCREASE_TEMP',
        wait: '500_MS_ELAPSED'
      };
    }
  }
];

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
    <Provider threads={lights}>
      <Bakery3 />
    </Provider>
    <p>
      Let's now try to simulate the environment by making
      the ovens turn hotter and colder (slowly) based on the
      off, medium and high controls.
    </p>
    <Provider
      threads={[whenOvenIsOnStartInterval, ...lights]}
    >
      <Bakery3 />
    </Provider>
    <p>
      The above program has a problem. When we turn the oven
      ON for some reason the temperature is set to -5
      degrees on all ovens.
    </p>
    <p>
      We will showcase the incremental patching capabilities
      of Behavioral Programming. Let us analyze the trace of
      events that cause the -5 to appear. We immedietaly
      realize that the `_DECREASE_TEMP` event is triggered.
      And it shouldn't. In a normal program we'd have to
      understand which condition caused this event to be
      triggered and why, but in BP we can specify which
      behaviors (traces of events) are mandatory and
      forbidden.
    </p>
    <p>
      For now we let's incrementally patch the system: we
      never want the `_DECREASE_TEMP` to be triggered unless
      an `_INCREASE_TEMP` was triggered. This requirement
      can <b>directly</b> be translated into a b-thread:
    </p>
    <pre>
      {`
const neverDecreaseTempUnlessItWasIncreasedFirst = [
  function*() {
    yield {
      block: '1_DECREASE_TEMP',
      wait: '1_INCREASE_TEMP'
    };
  },
  function*() {
    yield {
      block: '2_DECREASE_TEMP',
      wait: '2_INCREASE_TEMP'
    };
  },
  function*() {
    yield {
      block: '3_DECREASE_TEMP',
      wait: '3_INCREASE_TEMP'
    };
  }
];
      `}
    </pre>
    <Provider
      threads={[
        whenOvenIsOnStartInterval,
        ...lights,
        ...neverDecreaseTempUnlessItWasIncreasedFirst
      ]}
    >
      <Bakery3 />
    </Provider>
    <p>
      As we continue to use the app we notice another weird
      behavior: if we click on high or medium before the
      oven starts, then turn the oven on, and finally try
      switching one of the ovens to high, we see that two
      _INCREASE_TEMP are triggered in quick succession
      causing the temperature to immedietaly jump to 10
      degrees, instead of passing to 5.
    </p>
    <p>
      Again, in a normal programming setting to fix this
      we'd have to dig and figure out this timing issue
      which may or may not be trivial. Instead since we are
      programming behaviorally using b-threads we can try
      and fix this incrementally, but adding new b-threads.
    </p>
    <p>
      To patch this specific timing issue we can add a
      b-thread that checks whether two _INCREASE_TEMP events
      are triggered in quick succession. They should only
      ever be triggered 500ms from one another. If one is
      triggered in less than 500ms from the other, it is
      blocked.
    </p>
    <pre>
      {`
const blockQuickSuccessionIncreaseDecrease = [
  function*() {
    while (true) {
      yield {
        wait: '1_INCREASE_TEMP'
      };

      setTimeout(() => {
        this.request('500_MS_ELAPSED');
      }, 500);

      // block another other increase until 500ms have elapsed
      yield {
        block: '1_INCREASE_TEMP',
        wait: '500_MS_ELAPSED'
      };
    }
  }
]
        `}
    </pre>
    <Provider
      threads={[
        whenOvenIsOnStartInterval,
        ...lights,
        ...neverDecreaseTempUnlessItWasIncreasedFirst,
        ...blockQuickSuccessionIncreaseDecrease
      ]}
    >
      <Bakery3 />
    </Provider>
  </React.Fragment>
);
