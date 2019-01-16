import React from 'react';
import BProgram from 'behavioral';

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
      this.bp.addBThread(``, pr++, thread)
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
  request = event => this.props.bp.request(event);
  lastEvent = () => this.props.bp.lastEvent;

  render() {
    // const { component: Component } = this.props;
    return this.state.view;
  }
}

class ComponentPropsWithThread extends React.Component {
  state = { props: null };
  componentDidMount() {
    // Context value is this.props.bp
    const { bp, threads, priority } = this.props;
    let pr = 1;
    threads.forEach(thread =>
      bp.addBThread(``, pr++, thread.bind(this))
    );

    // SET_PROPS
    let that = this;
    bp.addBThread(``, pr++, function*() {
      while (true) {
        yield {
          wait: [event => event.type === that]
        };
        that.setProps(that.lastEvent().payload);
      }
    });

    bp.run();
    this.bp = bp;
  }

  componentDidUpdate(prevProps, prevState) {
    // Previous Context value is prevProps.bp
    // New Context value is this.props.bp
  }

  // updateView = view => this.setState({ view });
  setProps = props =>
    this.setState(prevState => ({
      props: { ...prevState.props, ...props }
    }));
  request = event => this.props.bp.request(event);
  lastEvent = () => this.props.bp.lastEvent;

  render() {
    const { component: Component } = this.props;
    const { props } = this.state;
    return <Component {...props} />;
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
