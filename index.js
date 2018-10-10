import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from './src/react-behavioral';

import {
  allLines,
  generateThreads,
  matchAny,
  allCells
} from './utils';

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
  this.updateView('Hello world: ' + this.bp.lastPayload);
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

const Log = connect(function*() {
  const style = {
    float: 'right',
    width: '200px',
    height: '160px'
  };
  this.updateView(<textarea id="log" style={style} />);
  const log = [];

  while (true) {
    yield {
      wait: [() => true]
    };
    log.push(
      `{ type: "${this.bp.lastEvent}", payload: ${
        this.bp.lastPayload
      } }`
    );
    this.updateView(
      <textarea id="log" style={style} value={log.join('\n')} />
    );
  }
});

function* ReactCell() {
  const { idx } = this.props;
  this.updateView(
    <button
      onClick={e => {
        if (e.shiftKey) {
          return this.request('O', idx);
        }
        this.request('X', idx);
      }}
    />
  );
  yield {
    wait: [
      (event, payload) =>
        (event === 'X' || event === 'O') && payload === idx
    ]
  };
  this.updateView(<button>{this.bp.lastEvent}</button>);
}

const Cell = connect(ReactCell);

function* detectWinByX() {
  yield {
    wait: ['X']
  };
  yield {
    wait: ['X']
  };
  yield {
    wait: ['X']
  };
  yield {
    request: ['XWins']
  };
}

const ShowWins = connect(function*() {
  yield {
    wait: ['XWins', 'OWins']
  };
  this.updateView(this.bp.lastEvent);
});

function Wrapper(props) {
  return (
    <div style={{ display: 'flex', width: '100%' }}>
      {props.children}
    </div>
  );
}
function Board(props) {
  return <div style={{ flex: '1' }}>{props.children}</div>;
}

const threads1 = [
  ...generateThreads(
    allLines,
    ([cell1, cell2, cell3]) =>
      function* detectWinByX() {
        const eventFn = matchAny('X', [cell1, cell2, cell3]);
        yield {
          wait: [eventFn]
        };
        yield {
          wait: [eventFn]
        };
        yield {
          wait: [eventFn]
        };
        yield {
          request: ['XWins']
        };
      }
  ),
  ...generateThreads(
    allLines,
    ([cell1, cell2, cell3]) =>
      function* detectWinByO() {
        const eventFn = matchAny('O', [cell1, cell2, cell3]);
        yield {
          wait: [eventFn]
        };
        yield {
          wait: [eventFn]
        };
        yield {
          wait: [eventFn]
        };
        yield {
          request: ['OWins']
        };
      }
  )
];

function* enforcePlayerTurns() {
  while (true) {
    yield { wait: ['X'], block: ['O'] };
    yield { wait: ['O'], block: ['X'] };
  }
}

ReactDOM.render(
  <React.Fragment>
    <h2>react-behavioral</h2>
    <pre>yarn add react-behavioral</pre>
    <p>
      <a href="https://twitter.com/search?q=%23BehavioralProgramming">
        #BehavioralProgramming
      </a>{' '}
      is a paradigm that was coined by David Harel and others in{' '}
      <a href="http://www.wisdom.weizmann.ac.il/~amarron/BP%20-%20CACM%20-%20Author%20version.pdf">
        this paper
      </a>.
    </p>
    <p>
      It's a different way of programming that is more aligned
      with how people think about behavior. Specifically we
      program using these software modules called{' '}
      <b>b-threads</b> (aka function generators) that run in
      parallel and can{' '}
      <span style={{ color: 'blue' }}>request</span>,{' '}
      <span style={{ color: 'green' }}>wait</span> and{' '}
      <span style={{ color: 'red' }}>block</span> events.
    </p>
    <p>
      <a href="https://github.com/lmatteis/react-behavioral">
        react-behavioral
      </a>{' '}
      is a library, specifically targeted at React, that
      implements this paradigm.
    </p>
    <h3>TicTacToe Example</h3>
    <p>
      To understand better how BP (short for
      BehavioralProgramming) works let's imagine that we wanted
      to teach a person how to play the TicTacToe game.
    </p>
    <p>
      We'd first start by showing the board to the person and
      we'd tell them that we can draw Xs and Os on this board.
      Try clicking on the board yourself; shift-click to draw Os.
      On the right we have a cronological view of the log of
      events as they happen.
    </p>
    <Provider>
      <Wrapper>
        <Board>
          <Cell idx={0} /> <Cell idx={1} /> <Cell idx={2} />{' '}
          <br />
          <Cell idx={3} /> <Cell idx={4} /> <Cell idx={5} />{' '}
          <br />
          <Cell idx={6} /> <Cell idx={7} /> <Cell idx={8} />{' '}
          <br />
        </Board>
        <Log />
      </Wrapper>
    </Provider>
    <p>
      Every time a cell on the board is clicked a new event is
      triggered that looks something like:
      <pre>{`{ type: 'X', payload: 3 }`}</pre>
      Where <code>type</code> can be either X or O and the{' '}
      <code>payload</code> is a number between 0 and 8
      representing a cell's position.
    </p>
    <h4>DetectWins</h4>
    <p>
      Let's continue teaching the human (or computer) about how
      the game should work. We want to detect when a line of Xs
      or Os has been filled, and request a Win. Essentially we're
      looking for a trace of events of this kind:
      <pre>
        {`
{ type: 'X', payload: 0 }
{ type: 'X', payload: 1 }
{ type: 'X', payload: 2 }
        `}
      </pre>
    </p>
    <p>
      We'll start coding our first b-thread which is aligned with
      our requirements which is called <b>detectWinByX</b>:
    </p>
    <p>
      <pre>{detectWinByX.toString()}</pre>
    </p>
    <p>
      Here were are introducing the 3 main critical pillers of
      Behavioral Programming; the{' '}
      <span style={{ color: 'blue' }}>request</span>,{' '}
      <span style={{ color: 'green' }}>wait</span> and{' '}
      <span style={{ color: 'red' }}>block</span> semantics.
    </p>
    <p>
      A b-thread can yield an object with a key being any of
      these 3 operators. When the key is{' '}
      <span style={{ color: 'green' }}>wait</span>, the execution
      of the generator will stop at that section until such event
      is triggered by other b-threads or by the outside world.{' '}
    </p>
    <p>
      When a <span style={{ color: 'blue' }}>request</span> is
      yielded, the behavioral system will <b>try</b> to trigger
      such event. I highlight the "try" because a{' '}
      <span style={{ color: 'blue' }}>request</span> is only a
      proposal for that event to be considered for triggering.
    </p>
    <p>
      Finally, and more importantly, when a{' '}
      <span style={{ color: 'red' }}>block</span> is yielded,
      other b-threads are forbidded to trigger such event.
    </p>
    <p>
      These 3 magical operators can also be combined together;
      one can yield a block and a wait together, effectively
      "blocking until another event happens". Or one can yield a
      request with a wait, effectively aborting the request when
      the wait event happens.
    </p>
    <p>
      There are other semantics surronding these 3 operators, but
      they are crucial to the functioning of Behavioral
      Programming, hence the official image from the paper is
      needed:
    </p>
    <p>
      <img src="./rwb.png" />
    </p>
    <p>
      Let's go back to our detectWinByX b-thread and analyze how
      it's simply waiting for three X's in a row and then
      requests XWins. Try drawing 3 X's on the board below:
    </p>
    <Provider threads={[detectWinByX]}>
      <Wrapper>
        <Board>
          <Cell idx={0} /> <Cell idx={1} /> <Cell idx={2} />{' '}
          <br />
          <Cell idx={3} /> <Cell idx={4} /> <Cell idx={5} />{' '}
          <br />
          <Cell idx={6} /> <Cell idx={7} /> <Cell idx={8} />{' '}
          <br />
        </Board>
        <Log />
      </Wrapper>
    </Provider>
    <p>
      You'll notice that from the b-thread defined earlier, an
      XWins event is triggered once the trace is found. However
      the detectWinByX thread is incomplete. To detect a win we
      can't simply listen out for any 3 X events, they need to
      form a line. More specifically in fact we need to create 8
      threads, each of which listen out for a specific line and
      then declare a win:
    </p>
    <p>
      <pre>
        {`
...generateThreads(
  allLines,
  ([cell1, cell2, cell3]) =>
    function* detectWinByX() {
      const eventFn = matchAny('X', [cell1, cell2, cell3]);
      yield {
        wait: [eventFn]
      };
      yield {
        wait: [eventFn]
      };
      yield {
        wait: [eventFn]
      };
      yield {
        request: ['XWins']
      };
  }
)
      `}
      </pre>
    </p>
    <p>
      With a little help from some utility functions we can now
      see the desired outcome. I've also added the same b-threads
      to trace O lines and trigger an OWins event when it
      happens. Try it out below:
    </p>
    <Provider threads={threads1}>
      <Wrapper>
        <Board>
          <Cell idx={0} /> <Cell idx={1} /> <Cell idx={2} />{' '}
          <br />
          <Cell idx={3} /> <Cell idx={4} /> <Cell idx={5} />{' '}
          <br />
          <Cell idx={6} /> <Cell idx={7} /> <Cell idx={8} />{' '}
          <br />
        </Board>
        <Log />
      </Wrapper>
    </Provider>
    <h3>EnforcePlayerTurns</h3>

    <p>
      So far so good. We haven't done anything extremely
      mind-blowing. Well hold on to your seat as we continue
      teaching the computer how to play TicTacToe.
    </p>

    <p>
      We will now add the <b>enforcePlayerTurns</b> b-thread,
      which is again aligned to the requirements: we should not
      be able to trigger two X's or two O's in a row. In other
      words, when X goes, only O is allowed after it and so on.
      This is how the game works!
    </p>
    <p>
      <pre>
        {`
function* enforcePlayerTurns() {
  while (true) {
    yield { wait: ['X'], block: ['O'] };
    yield { wait: ['O'], block: ['X'] };
  }
}
      `}
      </pre>
    </p>
    <p>
      Here is where things start getting really interesting.
      Behavioral Programming allows us to shape the behavior of
      our program in an <b>incremental</b> fashion. As new ideas
      and requirements are discovered, we can forbid certain
      things from happening by simply adding new b-threads;
      without having to dig and figure out how earlier-written
      code works!
    </p>
    <p>
      This is really huge and in fact I believe game-changing, so
      I'll curb the excitement for now and show you what the game
      looks like now that we added this b-thread:
    </p>
    <Provider threads={[...threads1, enforcePlayerTurns]}>
      <Wrapper>
        <Board>
          <Cell idx={0} /> <Cell idx={1} /> <Cell idx={2} />{' '}
          <br />
          <Cell idx={3} /> <Cell idx={4} /> <Cell idx={5} />{' '}
          <br />
          <Cell idx={6} /> <Cell idx={7} /> <Cell idx={8} />{' '}
          <br />
        </Board>
        <Log />
      </Wrapper>
    </Provider>
    <p>
      Try adding two X's in a row. It will not work. It's waiting
      for an O, and once that is triggered it waits for an X and
      so on.
    </p>
  </React.Fragment>,
  document.getElementById('content')
);
