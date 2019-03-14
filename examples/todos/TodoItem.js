import * as React from 'react';
import { connectProps } from '../../src/react-behavioral';

function TodoItem({ todo, onDelete }) {
  return (
    <li className="todo-item">
      <span>{todo}</span>
      <button onClick={onDelete}>Delete</button>
    </li>
  );
}

export default connectProps(function*() {
  this.setProps({
    onDelete: e =>
      this.request({
        type: 'deleteTodo',
        payload: this.props.index
      })
  });
})(TodoItem);
