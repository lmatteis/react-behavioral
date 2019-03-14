import * as React from 'react';
import TodoItem from './TodoItem';
import { connectProps } from '../../src/react-behavioral';

function TodoList({
  todos = [],
  todoCount,
  lastUpdated,
  onDelete
}) {
  return (
    <div>
      <div className="count">
        You have {todoCount} todos
      </div>
      <ul className="todos">
        {todos.map((todo, index) => (
          <li className="todo-item">
            <span>{todo}</span>
            <button onClick={() => onDelete(index)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      <div className="lastUpdated">
        Last updated:{' '}
        {lastUpdated
          ? new Date(lastUpdated).toString()
          : 'never'}
      </div>
    </div>
  );
}
export default connectProps(
  function*() {
    let todos = [];
    this.setProps({
      todos,
      todoCount: 0,
      onDelete: index =>
        this.request({ type: 'deleteTodo', payload: index })
    });
    while (true) {
      let todo = yield { wait: ['addTodo', 'deleteTodo'] };
      if (todo.type === 'addTodo') {
        this.setProps(prev => ({
          todos: [...prev.todos, todo.payload],
          todoCount: [...prev.todos, todo.payload].length
        }));
      } else if (todo.type === 'deleteTodo') {
        this.setProps(prev => ({
          todos: prev.todos.filter(
            (t, idx) => idx !== todo.payload
          ),
          todoCount: prev.todos.filter(
            (t, idx) => idx !== todo.payload
          ).length
        }));
      }
    }
  },
  function*() {
    while (true) {
      let todo = yield { wait: ['addTodo', 'deleteTodo'] };
      this.setProps({
        lastUpdated: Date.now()
      });
    }
  }
)(TodoList);
