import 'regenerator-runtime/runtime'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, connect } from './src/react-behavioral'

import {
  allLines,
  generateThreads,
  matchAny,
  allCells
} from './utils'

function* Button() {
  this.updateView(
    <button
      onClick={() => {
        this.request('BUTTON_CLICKED', 'ciao')
      }}
    >
      Click me twice!
    </button>
  )
  yield {
    wait: ['SHOW_HELLO_WORLD']
  }
  this.updateView('Hello world: ' + this.bp.lastPayload)
}
const ButtonContainer = connect(Button)

const threads = [
  function* click() {
    yield {
      wait: ['BUTTON_CLICKED']
    }
    yield {
      request: ['SHOW_HELLO_WORLD'],
      payload: this.bp.lastPayload
    }
  },
  function* doubleClick() {
    yield {
      wait: ['BUTTON_CLICKED']
    }
    yield {
      block: ['SHOW_HELLO_WORLD'],
      wait: ['BUTTON_CLICKED']
    }
  }
]

const Log = connect(function*() {
  const style = {
    float: 'right',
    width: '200px',
    height: '160px'
  }
  this.updateView(<textarea id="log" style={style} />)
  const log = []

  while (true) {
    yield {
      wait: [() => true]
    }
    if (this.bp.lastPayload !== undefined) {
      log.push(
        `{ type: "${this.bp.lastEvent}", payload: ${
          this.bp.lastPayload
        } }`
      )
    } else {
      log.push(`{ type: "${this.bp.lastEvent}" }`)
    }

    this.updateView(
      <textarea
        id="log"
        style={style}
        value={log.join('\n')}
      />
    )
  }
})

function* ReactCell() {
  const { idx } = this.props
  this.updateView(
    <button
      onClick={e => {
        if (e.shiftKey) {
          return this.request('O', idx)
        }
        this.request('X', idx)
      }}
    />
  )
  const eventFn = (event, payload) =>
    (event === 'X' || event === 'O') && payload === idx
  yield {
    wait: [eventFn]
  }
  this.updateView(<button>{this.bp.lastEvent}</button>)
  yield {
    block: [eventFn]
  }
}

const Cell = connect(ReactCell)

function* detectWinByX() {
  yield {
    wait: ['X']
  }
  yield {
    wait: ['X']
  }
  yield {
    wait: ['X']
  }
  yield {
    request: ['XWins']
  }
}

const ShowWins = connect(function*() {
  yield {
    wait: ['XWins', 'OWins']
  }
  this.updateView(this.bp.lastEvent)
})

function Wrapper(props) {
  return (
    <div style={{ display: 'flex', width: '100%' }}>
      {props.children}
    </div>
  )
}
function Board(props) {
  return (
    <div style={{ flex: '1' }}>
      {props.children}
      <div style={{ fontSize: '10px', marginTop: '20px' }}>
        (shift+click to draw O)
      </div>
    </div>
  )
}

const threads1 = [
  ...generateThreads(
    allLines,
    ([cell1, cell2, cell3]) =>
      function* detectWinByX() {
        const eventFn = matchAny('X', [cell1, cell2, cell3])
        yield {
          wait: [eventFn]
        }
        yield {
          wait: [eventFn]
        }
        yield {
          wait: [eventFn]
        }
        yield {
          request: ['XWins']
        }
      }
  ),
  ...generateThreads(
    allLines,
    ([cell1, cell2, cell3]) =>
      function* detectWinByO() {
        const eventFn = matchAny('O', [cell1, cell2, cell3])
        yield {
          wait: [eventFn]
        }
        yield {
          wait: [eventFn]
        }
        yield {
          wait: [eventFn]
        }
        yield {
          request: ['OWins']
        }
      }
  )
]

function* enforcePlayerTurns() {
  while (true) {
    yield { wait: ['X'], block: ['O'] }
    yield { wait: ['O'], block: ['X'] }
  }
}
function* stopGameAfterWin() {
  yield {
    wait: ['XWins', 'OWins']
  }
  yield {
    block: ['X', 'O']
  }
}

const defaultMoves = generateThreads(
  allCells,
  cellNumber =>
    function*() {
      while (true) {
        yield {
          request: ['O'],
          payload: cellNumber
        }
      }
    }
)

function* startAtCenter() {
  yield {
    request: ['O'],
    payload: 4
  }
}

const preventCompletionOfLineWithTwoXs = generateThreads(
  allLines,
  ([cell1, cell2, cell3]) =>
    function* detectWinByO() {
      const eventFn = matchAny('X', [cell1, cell2, cell3])
      let line = [cell1, cell2, cell3]

      // Wait for two X's
      yield {
        wait: [eventFn]
      }
      line = line.filter(n => n !== this.bp.lastPayload)
      yield {
        wait: [eventFn]
      }
      line = line.filter(n => n !== this.bp.lastPayload)

      // Request an O
      yield {
        request: ['O'],
        payload: line[0]
      }
    }
)

ReactDOM.render(
  <React.Fragment>
    <h2>react-behavioral</h2>
    <pre>yarn add react-behavioral</pre>
    <p>
      <a href="https://twitter.com/search?q=%23BehavioralProgramming">
        #BehavioralProgramming
      </a>{' '}
      is a paradigm that was coined by David Harel, Assaf
      Marron and Gera Weiss (<a href="http://www.wisdom.weizmann.ac.il/~amarron/BP%20-%20CACM%20-%20Author%20version.pdf">
        paper
      </a>).
    </p>
    <p>
      It's a different way of programming that is more
      aligned with how people think about behavior.
      Specifically we program using these software modules
      called <b>b-threads</b> (aka function generators) that
      run in parallel and can{' '}
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
    <h2>TicTacToe Example</h2>
    <p>
      To understand better how BP (short for
      BehavioralProgramming) works let's imagine that we
      wanted to teach a person how to play the TicTacToe
      game.
    </p>
    <p>
      We'd first start by showing the board to the person
      and we'd tell them that we can draw Xs and Os on this
      board. Try clicking on the board yourself; shift-click
      to draw Os. On the right we have a chronological view
      of the log of events as they happen.
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
      Every time a cell on the board is clicked a new event
      is triggered that looks something like:
      <pre>{`{ type: 'X', payload: 3 }`}</pre>
      Where <code>type</code> can be either X or O and the{' '}
      <code>payload</code> is a number between 0 and 8
      representing a cell's position.
    </p>
    <p>
      All of this document is actually programmed using the{' '}
      <b>react-behavioral</b> library. Please check{' '}
      <a href="https://codesandbox.io/s/github/lmatteis/react-behavioral">
        this CodeSandbox
      </a>{' '}
      if you're interested in learning about how each
      component works.
    </p>
    <h3>DetectWins</h3>
    <p>
      Let's continue teaching the human (or computer) about
      how the game should work. We want to detect when a
      line of Xs or Os has been filled, and request a Win.
      Essentially we're looking for a trace of events of
      this kind:
      <pre>
        {`
{ type: 'X', payload: 0 }
{ type: 'X', payload: 1 }
{ type: 'X', payload: 2 }
        `}
      </pre>
    </p>
    <p>
      We'll start coding our first b-thread which is aligned
      with our requirements which is called{' '}
      <b>detectWinByX</b>:
    </p>
    <p>
      <pre>{`
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
      `}</pre>
    </p>
    <p>
      Here were are introducing the 3 main critical pillars
      of Behavioral Programming; the{' '}
      <span style={{ color: 'blue' }}>request</span>,{' '}
      <span style={{ color: 'green' }}>wait</span> and{' '}
      <span style={{ color: 'red' }}>block</span> semantics.
    </p>
    <p>
      A b-thread can yield an object with a key being any of
      these 3 operators. When the key is{' '}
      <span style={{ color: 'green' }}>wait</span>, the
      execution of the generator will stop at that section
      until such event is triggered by other b-threads or by
      the outside world.{' '}
    </p>
    <p>
      When a <span style={{ color: 'blue' }}>request</span>{' '}
      is yielded, the behavioral system will <b>try</b> to
      trigger such event. I highlight the "try" because a{' '}
      <span style={{ color: 'blue' }}>request</span> is only
      a proposal for that event to be considered for
      triggering.
    </p>
    <p>
      Finally, and more importantly, when a{' '}
      <span style={{ color: 'red' }}>block</span> is
      yielded, other b-threads are forbid to trigger such
      event.
    </p>
    <p>
      These 3 magical operators can also be combined
      together; one can yield a block and a wait together,
      effectively "blocking until another event happens". Or
      one can yield a request with a wait, effectively
      aborting the request when the wait event happens.
    </p>
    <p>
      There are other semantics surrounding these 3
      operators and they are crucial to the functioning of
      Behavioral Programming, hence the official image from
      the paper is needed:
    </p>
    <p>
      <img src="./rwb.png" />
    </p>
    <p>
      Let's go back to our detectWinByX b-thread and analyze
      how it's simply waiting for three X's in a row and
      then requests XWins. Try drawing 3 X's on the board
      below:
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
      You'll notice that from the b-thread defined earlier,
      an XWins event is triggered once the trace is found.
      However the detectWinByX thread is incomplete. To
      detect a win we can't simply listen out for any 3 X
      events, they need to form a line. More specifically in
      fact we need to create 8 threads, each of which listen
      out for a specific line and then declare a win:
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
      With a little help from some utility functions we can
      now see the desired outcome. I've also added the same
      b-threads to trace O lines and trigger an OWins event
      when it happens. Try it out below:
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
    <p>
      <blockquote>
        <h4>Feature 1: behavioral autonomy.</h4>
        Behavioral programming makes it possible to
        encapsulate the implementation of each behavior
        requirement in an autonomous software object. For
        example, the above b-threads deal with winning
        conditions only, and are not concerned with issues
        irrelevant to that purpose (such as the enforcement
        of alternating turns, or the choice of an opening
        move). (<a href="https://www.cs.bgu.ac.il/~geraw/Publications_files/BPJECOOP.pdf">
          paper
        </a>)
      </blockquote>
    </p>
    <h3>EnforcePlayerTurns</h3>

    <p>
      So far so good. We haven't done anything extremely
      mind-bending. Next we'll continue teaching the
      computer how to play TicTacToe.
    </p>

    <p>
      We will now add the <b>enforcePlayerTurns</b>{' '}
      b-thread, which is again aligned to the requirements:
      we should not be able to trigger two X's or two O's in
      a row. In other words, when X goes, only O is allowed
      after it and so on. This is how the game works!
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
      Behavioral Programming allows us to shape the behavior
      of our program in an <b>incremental</b> fashion. As
      new ideas and requirements are discovered, we can
      forbid certain things from happening by simply adding
      new b-threads; without having to dig and figure out
      how earlier-written code works!
    </p>
    <p>
      This is really huge and in fact I believe
      game-changing, so I'll curb the excitement for now and
      show you what the game looks like now that we added
      this b-thread:
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
      Try adding two X's in a row. It will not work. It's
      waiting for an O, and once that is triggered it waits
      for an X and so on.
    </p>
    <h3>StopGameAfterWin</h3>
    <p>
      We notice as we play the game that after a win is
      announced we can still play the game. This can easily
      be fixed again by adding a new b-thread
      (incrementality 😜):
    </p>
    <p>
      <pre>
        {`
function* stopGameAfterWin() {
  yield {
    wait: ['XWins', 'OWins']
  };
  yield {
    block: ['X', 'O']
  };
}
      `}
      </pre>
    </p>
    <p>
      <blockquote>
        <h4>
          Feature 2: positive and negative incrementality
        </h4>{' '}
        In addition to adding new behaviors, and thus
        helping build up the desired dynamics of the system,
        a b-thread can <b>constrain</b> the dynamics by
        forbidding unwanted behaviors. This ability allows
        programmers to “sculpt” the system under
        construction, adding, removing or suppressing
        behaviors, with little or no need to modify the code
        of existing b-threads.
      </blockquote>
    </p>
    <h2>Programming the strategy</h2>
    <p>
      So far we programmed the <b>basic rules</b> for the
      game. We shaped and sculpted the behavior
      incrementally, in a way that didn't require us to go
      back into already-written code to figure out
      state-based cases and change them accordingly to
      accommodate the new behavior.
    </p>
    <p>
      Instead we programmed in a <i>scenario-based</i>{' '}
      fashion (a scenario being a b-thread) which seems to
      be much more natural. As a consequence of this, state
      is actually implicit rather than explicit; not once we
      had to worry about iterating over cells or peeking at
      the current state.
    </p>
    <p>
      Next we'll move into programming strategy for the
      game: we want the computer to play with us.
    </p>
    <h3>DefaultMoves</h3>
    <p>
      For a second let's imagine that we forgot entirely
      about all the code that we have written so far. Or we
      can imagine that this code was written by other
      people. We don't care. We need to update our game as
      new requirements come in. This new requirement seems
      like a tuff one, they want the O's to appear
      automatically as the user positions X's on the board.
    </p>
    <p>
      <pre>
        {`
const defaultMoves = generateThreads(
  allCells,
  cellNumber =>
    function*() {
      while (true) {
        yield {
          request: ['O'],
          payload: cellNumber
        };
      }
    }
);
    `}
      </pre>
    </p>
    <p>
      Here we are creating a b-thread for each cell, where
      each is simply requesting to draw an O in such cell
      location. We're essentially trying to draw O's on the
      board, constantly.
    </p>
    <p>
      Below we see the game with the above b-thread. Try
      playing the game, you'll magically see the O's
      appearing on the board. In the right positions!
    </p>
    <Provider
      threads={[
        ...threads1,
        enforcePlayerTurns,
        stopGameAfterWin,
        ...defaultMoves
      ]}
    >
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
    <h3>StartAtCenter</h3>
    <p>
      New developers come on board, they start playing the
      game, they see the event trace, but they want the O's
      to start at the center of the board (position 4).
      Normally we'd have to dig into already-written code to
      figure something like this out, possibly changing
      behavior inadvertently. But with BP everything seems
      easier:
    </p>
    <p>
      <pre>
        {`
function* startAtCenter() {
  yield {
    request: ['O'],
    payload: 4
  };
}
    `}
      </pre>
    </p>
    <p>
      For this b-thread to work we need to introduce the
      final pillar element of Behavioral Programming:{' '}
      <b>priority</b>. Each b-thread has a specific number
      attached to them which essentially dictates which
      event should be requested in the case several
      b-threads are requesting the same event. In this case
      the O is also being requested by the{' '}
      <code>defaultMoves</code> thread. Hence we need to
      give <code>startAtCenter</code> a higher priority.
      Here's the final result:
    </p>
    <Provider
      threads={[
        ...threads1,
        enforcePlayerTurns,
        stopGameAfterWin,
        startAtCenter,
        ...defaultMoves
      ]}
    >
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
      <blockquote>
        <h4>Feature 3: early/partial execution</h4> Initial
        or partial versions of behavioral programs can be
        executed and can often display meaningful system
        behavior. This allows users and developers to
        observe the system’s behavior at any stage of
        development, even the earliest ones, and take
        necessary actions, such as confirming that
        requirements are met, adjusting requirements,
        correcting errors, etc.
      </blockquote>
    </p>
    <h3>PreventCompletionOfLineWithTwoXs</h3>
    <p>
      Finally to make things a little more interesting we
      want the computer to be a bit smarter rather than
      simply putting O's on the board in order from top-left
      to bottom-right.
    </p>
    <p>
      We want to have a b-thread observe when the user has
      drawn two X's in a line and then forcibly request an O
      (again with higher priority) so that it stops X from
      winning.
    </p>
    <p>
      <pre>
        {`
const preventCompletionOfLineWithTwoXs = generateThreads(
  allLines,
  ([cell1, cell2, cell3]) =>
    function* () {
      const eventFn = matchAny('X', [cell1, cell2, cell3]);
      let line = [cell1, cell2, cell3];

      // Wait for two X's
      yield {
        wait: [eventFn]
      };
      line = line.filter(n => n !== this.bp.lastPayload);
      yield {
        wait: [eventFn]
      };
      line = line.filter(n => n !== this.bp.lastPayload);

      // Request an O
      yield {
        request: ['O'],
        payload: line[0]
      };
    }
);
    `}
      </pre>
    </p>
    <p>
      This b-thread is a bit more beefy, but it's
      essentially waiting for two X's in a line. It records
      their payloads (the cell position) and then knows to
      request an O in the last cell in the line. Give it a
      shot, the computer just got smarter!
    </p>
    <Provider
      threads={[
        ...threads1,
        enforcePlayerTurns,
        stopGameAfterWin,
        ...preventCompletionOfLineWithTwoXs,
        startAtCenter,
        ...defaultMoves
      ]}
    >
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
    <h2>Conclusion</h2>
    <p>
      How does all this tie into UI-development and React?
      First of all Behavioral Programming is concept that
      can be applied to any reactive system ranging
      complicated robotics to simple UI development.
      Secondly, <b>react-behavioral</b> goes a step forward
      and makes a React component also a b-thread 😮.
    </p>
    <p>
      Matter of fact, each cell in the above example is a
      React component which looks like this:
    </p>
    <p>
      <pre>
        {`
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
  const eventFn = (event, payload) =>
    (event === 'X' || event === 'O') && payload === idx;
  yield {
    wait: [eventFn]
  };
  this.updateView(<button>{this.bp.lastEvent}</button>);
  yield {
    block: [eventFn]
  };
}

const Cell = connect(ReactCell);
    `}
      </pre>
    </p>
    <p>
      And then we can simply render using a Provider, which
      uses React's Context to pass events around:
    </p>
    <p>
      <pre>
        {`
<Provider
  threads={[
    ...threads1,
    enforcePlayerTurns,
    stopGameAfterWin,
    ...preventCompletionOfLineWithTwoXs,
    startAtCenter,
    ...defaultMoves
  ]}
>
  <Wrapper>
    <Board>
      <Cell idx={0} /> <Cell idx={1} />{' '}
      <Cell idx={2} /> <br />
      <Cell idx={3} /> <Cell idx={4} />{' '}
      <Cell idx={5} /> <br />
      <Cell idx={6} /> <Cell idx={7} />{' '}
      <Cell idx={8} /> <br />
    </Board>
    <Log />
  </Wrapper>
</Provider>
    `}
      </pre>
    </p>
    <p>
      I hope to have sparked some interest into this new way
      of programming. If you want to read more about it I
      highly suggest you read academics paper about it on
      google scholar "behavioral programming david harel".
    </p>
    <p>
      Also please checkout my slides on a talk I gave about
      these concepts{' '}
      <a href="https://lmatteis.github.io/behavioral-programming-talk/index.html">
        here
      </a>.
    </p>
  </React.Fragment>,
  document.getElementById('content')
)
