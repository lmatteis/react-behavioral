import React from 'react';
import BProgram from './bp.js';

const {
  Provider: ReactProvider,
  Consumer
} = React.createContext({});

export const Provider = class extends React.Component {
  constructor(props) {
    super(props);
    this.bp = new BProgram();

    const threads = this.props.threads || [];
    let pr = 1;
    this.bp.run();

    threads.forEach(thread =>
      this.bp.addBThread(``, pr++, thread.bind(this))
    );
  }
  render() {
    return (
      <ReactProvider value={this.bp}>
        {this.props.children}
      </ReactProvider>
    );
  }
};

class ComponentWithThread extends React.Component {
  state = { view: null };
  componentDidMount() {
    // Context value is this.props.bp
    const { bp, thread } = this.props;
    bp.addBThread('dispatch', 1, thread.bind(this));
    bp.run();
    this.bp = bp;
  }

  componentDidUpdate(prevProps, prevState) {
    // Previous Context value is prevProps.bp
    // New Context value is this.props.bp
  }

  updateView = view => this.setState({ view });
  request = (event, payload) =>
    this.props.bp.event(event, payload);

  render() {
    // const { component: Component } = this.props;
    return this.state.view;
  }
}

export function connect(thread) {
  return function(props) {
    return (
      <Consumer>
        {bp => (
          <ComponentWithThread
            {...props}
            thread={thread}
            bp={bp}
          />
        )}
      </Consumer>
    );
  };
}
