import React from 'react';
import BProgram from 'behavioral';

const {
  Provider: ReactProvider,
  Consumer
} = React.createContext({});

function request(e) {
  const name = 'request ' + e;
  var bt = function*() {
    yield {
      request: [e]
    };
  };
  // XXX should be lowest priority (1 is highest)
  this.addBThread(name, 1, bt);
  this.run(); // Initiate super-step
}

function bSync(obj) {
  var bt = function*() {
    yield obj;
  };
  // XXX should be lowest priority (1 is highest)
  this.addBThread('', 1, bt);
  this.run(); // Initiate super-step
}

export const Provider = class extends React.Component {
  constructor(props) {
    super(props);
    this.bp = new BProgram();

    const threads = this.props.threads || [];
    let pr = 1;
    this.bp.run();

    threads.forEach(thread => {
      if (Array.isArray(thread)) {
        this.bp.addBThread(
          ``,
          thread[0],
          thread[1].bind(this)
        );
      } else {
        this.bp.addBThread(``, pr++, thread.bind(this));
      }
    });
  }
  request = event => request.call(this.bp, event);
  bSync = event => bSync.call(this.bp, event);
  lastEvent = () => this.bp.lastEvent;
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
    const { bp, thread, priority } = this.props;
    bp.addBThread(
      'dispatch',
      priority || 1,
      thread.bind(this)
    );
    bp.run();
    this.bp = bp;
  }

  componentDidUpdate(prevProps, prevState) {
    // Previous Context value is prevProps.bp
    // New Context value is this.props.bp
  }

  updateView = view => this.setState({ view });
  request = event => request.call(this.props.bp, event);
  bSync = event => bSync.call(this.props.bp, event);
  lastEvent = () => this.props.bp.lastEvent;

  render() {
    // const { component: Component } = this.props;
    return this.state.view;
  }
}

class ComponentPropsWithThread extends React.Component {
  constructor(props) {
    super(props);
    this.state = props;
    this.mount = false;
  }
  componentDidMount() {
    this.mount = true;
    // Context value is this.props.bp
    const { bp, threads, priority } = this.props;
    let pr = 1;
    threads.forEach(thread => {
      if (Array.isArray(thread)) {
        bp.addBThread(``, thread[0], thread[1].bind(this));
      } else {
        bp.addBThread(``, pr++, thread.bind(this));
      }
    });
    bp.run();
    this.bp = bp;
  }

  componentWillUnmount() {
    this.mount = false;
  }

  componentDidUpdate(prevProps, prevState) {
    // Previous Context value is prevProps.bp
    // New Context value is this.props.bp
  }

  // updateView = view => this.setState({ view });
  setProps = (...props) =>
    this.mount && this.setState(...props);
  request = event => request.call(this.props.bp, event);
  bSync = event => bSync.call(this.props.bp, event);
  lastEvent = () => this.props.bp.lastEvent;

  render() {
    const {
      component: Component,
      bp,
      threads,
      priority,
      ...restProps
    } = this.state;
    return <Component {...restProps} />;
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

export function connectProps(...threads) {
  return function(Component) {
    return function(props) {
      return (
        <Consumer>
          {bp => (
            <ComponentPropsWithThread
              {...props}
              threads={threads}
              bp={bp}
              component={Component}
            />
          )}
        </Consumer>
      );
    };
  };
}
