import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import {
  Provider,
  connect
} from './src/react-behavioral';

function* Button() {
  this.updateView(
    <button
      onClick={() => {
        this.request('BUTTON_CLICKED', 'ciao');
      }}
    >
      Click me twice!
    </button>
  );
  yield {
    wait: ['SHOW_HELLO_WORLD']
  };
  this.updateView(
    'Hello world: ' + this.bp.lastPayload
  );
}
const ButtonContainer = connect(Button);

const threads = [
  function* click() {
    yield {
      wait: ['BUTTON_CLICKED']
    };
    yield {
      request: ['SHOW_HELLO_WORLD'],
      payload: this.bp.lastPayload
    };
  },
  function* doubleClick() {
    yield {
      wait: ['BUTTON_CLICKED']
    };
    yield {
      block: ['SHOW_HELLO_WORLD'],
      wait: ['BUTTON_CLICKED']
    };
  }
];

ReactDOM.render(
  <Provider threads={threads}>
    React Behavioral
    <div>
      <ButtonContainer />
    </div>
  </Provider>,
  document.getElementById('content')
);
