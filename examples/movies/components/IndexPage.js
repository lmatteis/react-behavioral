import React from 'react';
import { fetchMovies } from '../api';
import Icon from './Icon';
import Spinner from './Spinner';
import './IndexPage.css';

import { connectProps } from '../../../src/react-behavioral';

function Score({ score, icon }) {
  if (score === null || score < 0) return null;
  return (
    <React.Fragment>
      <Icon type={icon} size="tiny" /> {score}%
    </React.Fragment>
  );
}

function Movie({
  id,
  title,
  tomatoScore,
  tomatoIcon,
  popcornIcon,
  popcornScore,
  theaterReleaseDate,
  loading,
  highlight,
  onClick
}) {
  return (
    <div
      className={`Movie box ${loading ? 'loading' : ''} ${
        highlight ? 'highlight' : ''
      }`}
      onClick={() => onClick(id)}
    >
      <div className="content">
        <div className="title">{title}</div>
        <div className="sub-text">
          <Score icon={tomatoIcon} score={tomatoScore} /> ·{' '}
          <Score icon={popcornIcon} score={popcornScore} />{' '}
          · {theaterReleaseDate}
        </div>
      </div>
      {loading && <Spinner size="small" />}
    </div>
  );
}

function IndexPage({
  onMovieClick,
  loadingMovieId,
  highlightMovieIds = [],
  movies = [],
  loading
}) {
  if (loading) {
    return <Spinner />;
  }
  return (
    <div className="IndexPage">
      <h1>Top Box Office</h1>
      <div>
        {movies.map(infos => (
          <Movie
            key={infos.id}
            {...infos}
            loading={infos.id === loadingMovieId}
            highlight={highlightMovieIds.find(
              id => id === infos.id
            )}
            onClick={onMovieClick}
          />
        ))}
      </div>
    </div>
  );
}

export default connectProps(
  function*() {
    yield { request: 'renderedIndexPage' };
    this.setProps({ loading: true });
    yield { wait: 'updateIndexPage' };
    const movies = this.lastEvent().payload;
    this.setProps({ movies, loading: false }, () =>
      this.request('indexPageMoviesLoaded')
    );
  },
  function*() {
    while (true) {
      yield { wait: 'CLICKED_MOVIE' };
      this.setProps({
        loadingMovieId: this.lastEvent().payload
      });
    }
  },
  function*() {
    while (true) {
      yield { request: 'renderedIndexPage' };
      const { payload } = yield {
        wait: 'highlightMovieIds'
      };
      this.setProps({
        highlightMovieIds: payload
      });
    }
  }
)(IndexPage);
