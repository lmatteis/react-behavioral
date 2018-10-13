import 'regenerator-runtime/runtime';

import React from 'react';

export default () => (
  <React.Fragment>
    <h2>
      An interactive essay on the development lifetime
      of a shopping application
    </h2>
    <small>
      <strong>Abstract. </strong>
      In this essay I want to try and explore what are
      the most critical pain points that arise during
      the development of a complex system.
      Specifically I will explore through the
      development of a shopping app, that our current
      methods are ineffective when modeling a system
      that (i) constantly changes, and (ii) has a
      variety of people working on it that come and
      go. As a system becomes more complex it becomes
      inevitably harder to maintain and modify. As a
      result we will ask ourselves: can changes to the
      system not depend on its complexity? In other
      words: how easily can we implement new features without
      having to worry about how badly the system was
      built? We will explore the answer to this
      question using a paradigm named "Behavioral Programming" (aka
      scenario-based programming).
    </small>
    <pre>
      <a href="https://twitter.com/lmatteis">
        @lmatteis
      </a>
    </pre>
  </React.Fragment>
);
