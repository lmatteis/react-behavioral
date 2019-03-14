import * as React from 'react';
import { connectProps } from '../../src/react-behavioral';

function TodoInput(props) {
  return (
    <input
      className="todo-input"
      type="text"
      placeholder="What needs to be done?"
      {...props}
    />
  );
}

export default connectProps(function*() {
  this.setProps({
    onChange: e => {
      this.setProps({ value: e.target.value });
    },
    onKeyDown: e => {
      if (e.key === 'Enter') {
        this.request({
          type: 'addTodo',
          payload: e.target.value
        });
        this.setProps({ value: '' });
      }
    }
  });
})(TodoInput);
