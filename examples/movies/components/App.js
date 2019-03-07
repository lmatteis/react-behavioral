import React from 'react';
import Spinner from './Spinner';
import IndexPage from './IndexPage';
import MoviePage from './MoviePage';
import './App.css';

function AppSpinner() {
  return (
    <div className="AppSpinner">
      <Spinner size="large" />
    </div>
  );
}

export default class App extends React.Component {
  state = {
    currentMovieId: null,
    showDetail: false
  };
  // state = {
  //   currentMovieId: 771401855,
  //   showDetail: true
  // };

  render() {
    const { showDetail, currentMovieId } = this.state;
    return (
      <div className="App">
        <div>
          {showDetail && (
            <div
              className="back-link"
              onClick={this.handleBackClick}
            >
              ➜
            </div>
          )}
          {!showDetail ? (
            <IndexPage
              loadingMovieId={currentMovieId}
              onMovieClick={this.handleMovieClick}
            />
          ) : (
            <MoviePage movieId={currentMovieId} />
          )}
        </div>
      </div>
    );
  }

  handleMovieClick = movieId => {
    this.setState({
      currentMovieId: movieId,
      showDetail: true
    });
  };

  handleBackClick = () => {
    this.setState({
      currentMovieId: null,
      showDetail: false
    });
  };
}
