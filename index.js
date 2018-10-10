import 'regenerator-runtime/runtime'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, connect } from './src/react-behavioral'

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
  yield {
    wait: [
      (event, payload) =>
        (event === 'X' || event === 'O') && payload === idx
    ]
  }
  this.updateView(<button>{this.bp.lastEvent}</button>)
}

const Cell = connect(ReactCell)

const DetectWins = connect(function*() {
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
})

const ShowWins = connect(function*() {
  yield {
    wait: ['XWins', 'OWins']
  }
  this.updateView(this.bp.lastEvent)
})

ReactDOM.render(
  <React.Fragment>
    <h2>react-behavioral</h2>
    <pre>yarn add react-behavioral</pre>
    <p>
      <a href="https://twitter.com/search?q=%23BehavioralProgramming">
        #BehavioralProgramming
      </a>{' '}
      is a paradigm that was coined by David Harel and
      others in{' '}
      <a href="http://www.wisdom.weizmann.ac.il/~amarron/BP%20-%20CACM%20-%20Author%20version.pdf">
        this paper
      </a>.
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
    <h3>TicTacToe Example</h3>
    <p>
      To understand better how BP (short for
      BehavioralProgramming) works let's imagine that we
      wanted to teach a person how to play the TicTacToe
      game.
    </p>
    <p>
      We'd first start by showing the board to the person
      and we'd tell them that we can draw Xs and Os on this
      board (try clicking on the board yourself; shift-click
      to draw Os):
      <div>
        <Provider>
          <Cell idx={0} /> <Cell idx={1} /> <Cell idx={2} />{' '}
          <br />
          <Cell idx={3} /> <Cell idx={4} /> <Cell idx={5} />{' '}
          <br />
          <Cell idx={6} /> <Cell idx={7} /> <Cell idx={8} />{' '}
          <br />
        </Provider>
      </div>
    </p>
    <p>
      Every time a cell on the board is clicked a new event
      is broadcast that looks something like:
      <pre>{`{ type: 'X', payload: 3 }`}</pre>
      Where <code>type</code> can be either X or O and the{' '}
      <code>payload</code> is a number between 0 and 8
      representing each cell.
    </p>
    <h4>DetectWins</h4>
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
      with our requirement of <b>DetectWins</b>:
      <div>
        <Provider>
          <Cell idx={0} /> <Cell idx={1} /> <Cell idx={2} />{' '}
          <br />
          <Cell idx={3} /> <Cell idx={4} /> <Cell idx={5} />{' '}
          <br />
          <Cell idx={6} /> <Cell idx={7} /> <Cell idx={8} />{' '}
          <br />
          <ShowWins />
          <DetectWins />
        </Provider>
      </div>
    </p>
    <p>Foo</p>
  </React.Fragment>,
  document.getElementById('content')
)
