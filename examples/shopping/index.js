import 'regenerator-runtime/runtime';

import React from 'react';

export default () => (
  <React.Fragment>
    <h2>
      An interactive essay on the development lifecycle of a
      shopping application
    </h2>
    <pre>
      <a href="https://twitter.com/lmatteis">
        Luca Matteis
      </a>
    </pre>
    <small>
      <strong>Abstract. </strong>
      In this essay I want to try and explore what are the
      most critical pain points that arise during the
      development of a complex system. Specifically I will
      explore through the development of a shopping app,
      that our current methods are ineffective when modeling
      a system that (i) constantly changes, and (ii) has a
      variety of people working on it that come and go. As a
      system becomes more complex it becomes inevitably
      harder to maintain and modify. As a result we will ask
      ourselves: can changes to the system not depend on its
      complexity? In other words: how easily can we
      implement new features without having to worry about
      how badly the system was built? We will explore the
      answer to this question using a paradigm named
      "Behavioral Programming" (aka scenario-based
      programming).
    </small>
    <h2>Shopping app</h2>
    <p>
      To more easily understand what the{' '}
      <i>hurdles of development</i> are we will develop a
      shopping application similar to a simple e-commerce.
      More specifically we will develop the app using what
      is currently a standard library for UIs:{' '}
      <a href="https://reactjs.org/">ReactJS</a>.{' '}
    </p>
    <p>
      At each code example I will present two versions: on
      the left the currently "standard best-practices"
      version that we're all used to; on the right the
      "Behavioral Programming" (BP) version. As we go on
      with the examples the way BP works will become
      clearer.
    </p>
    <p>
      Without further a due here's what the app should look
      like during a first iteration:
    </p>
  </React.Fragment>
);
