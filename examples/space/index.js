import 'regenerator-runtime/runtime';
import TrackVisibility from 'react-on-screen';

import React from 'react';
import ReactDOM from 'react-dom';

import {
  Provider,
  connect,
  connectProps
} from '../../src/react-behavioral';

const Log = connect(function*() {
  const style = {
    float: 'right',
    width: '200px',
    height: '160px',
    marginRight: '-200px',
    fontSize: '10px'
  };
  this.updateView(<textarea id="log" style={style} />);
  const log = [];

  while (true) {
    yield {
      wait: [() => true]
    };
    if (this.lastEvent().payload !== undefined) {
      log.push(
        `{ type: "${this.lastEvent().type}", payload: ${
          this.lastEvent().payload
        } }`
      );
    } else {
      log.push(`{ type: "${this.lastEvent().type}" }`);
    }

    this.updateView(
      <textarea
        id="log"
        style={style}
        value={log.join('\n')}
      />
    );
  }
});

const Space = () => (
  <React.Fragment>
    <h1>🚀Welcome to Behavioral Space Programming</h1>
    <TrackVisibility>
      {({ isVisible }) => (
        <video src="https://player.vimeo.com/external/178164947.hd.mp4?s=63062e08bf6ba39d347a96fdb9c9089e39dfb8ed&profile_id=119&oauth2_token_id=57447761&download=1" />
      )}
    </TrackVisibility>
    <h1>
      Behavioral programming simplifies the task of dealing
      with underspecification and conflicting requirements
      by enabling the addition of software modules that can
      not only add to but also modify existing behaviors.
    </h1>
    <video src="https://player.vimeo.com/external/188557098.hd.mp4?s=911c1c900d991c43cec89ed87bd2578ca7060d4c&profile_id=174&oauth2_token_id=57447761&download=1" />
  </React.Fragment>
);

ReactDOM.render(
  <Space />,
  document.getElementById('content')
);
