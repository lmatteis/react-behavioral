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
          type: 'SET_LEVEL',
          payload: value
        })
    });
  },
  function*() {
    while (true) {
      yield {
        wait: 'SET_LEVEL'
      };
      this.setProps({
        selectedOption: this.lastEvent().payload
      });
    }
  }
)(RadioBoxes);

const ThermometerContainer = connectProps(
  function* whenLevelIsSetIncreaseDecrease() {
    while (true) {
      yield {
        wait: 'SET_LEVEL'
      };
      yield {
        request: 'INCREASE'
      };
    }
  },
  function* whenLevelIsSetIncreaseDecrease() {
    while (true) {
      yield {
        wait: 'SET_LEVEL'
      };
      yield {
        request: 'DECREASE'
      };
    }
  }
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
      <RadioBoxesContainer />
      <ThermometerContainer
        theme="light"
        value="0"
        max="100"
        steps="3"
        format="°C"
        size="large"
        height="300"
      />
    </div>
  );
}

export default () => (
  <Provider>
    <Log />
    <Oven />
  </Provider>
);
