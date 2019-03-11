import React from 'react';
import Spinner from './Spinner';
import IndexPage from './IndexPage';
import MoviePage from './MoviePage';
import './App.css';

import { connect } from '../../../src/react-behavioral';

function AppSpinner() {
  return (
    <div className="AppSpinner">
      <Spinner size="large" />
    </div>
  );
}

class App extends React.Component {
  render() {
    const {
      showDetail,
      currentMovieId,
      onBackClick,
      onMovieClick
    } = this.props;
    return (
      <div className="App">
        <div>
          {showDetail && (
            <div
              className="back-link"
              onClick={onBackClick}
            >
              ➜
            </div>
          )}
          {!showDetail ? (
            <IndexPage
              loadingMovieId={currentMovieId}
              onMovieClick={onMovieClick}
            />
          ) : (
            <MoviePage movieId={currentMovieId} />
          )}
        </div>
      </div>
    );
  }
}

export default connect(function*() {
  const onMovieClick = movieId => {
    this.request({
      type: 'CLICKED_MOVIE',
      payload: movieId
    });
  };
  const onBackClick = () => this.request('CLICKED_BACK');
  while (true) {
    this.updateView(
      <App
        onMovieClick={onMovieClick}
        onBackClick={onBackClick}
      />
    );

    yield { wait: 'updateMoviePage' };
    const movie = this.lastEvent().payload;
    this.updateView(
      <App
        onMovieClick={onMovieClick}
        onBackClick={onBackClick}
        showDetail={true}
      />
    );
    yield {
      request: { type: 'updateMoviePage', payload: movie }
    };
    yield { wait: 'CLICKED_BACK' };
  }
});
