import * as React from 'react';
import TodoInput from './TodoInput';
import TodoList from './TodoList';

export default function App() {
  return (
    <div className="App">
      <h1>Todo</h1>
      <TodoInput />
      <TodoList />
    </div>
  );
}
