import {
  fetchMovies,
  fetchMovieDetails,
  fetchMovieReviews
} from './api';

export default [
  function* log() {
    while (true) {
      yield { wait: () => true };
      console.log(this.lastEvent());
    }
  },
  function*() {
    while (true) {
      yield { request: 'fetchMovies' };
      fetchMovies().then(movies => {
        this.request({
          type: 'fetchMoviesSuccess',
          payload: movies
        });
      });
      yield { wait: 'CLICKED_BACK' };
    }
  },
  function*() {
    while (true) {
      yield { wait: 'fetchMoviesSuccess' };
      yield {
        request: {
          type: 'updateIndexPage',
          payload: this.lastEvent().payload
        }
      };
    }
  },
  function*() {
    while (true) {
      yield { wait: 'CLICKED_MOVIE' };
      yield {
        request: {
          type: 'fetchMovieDetails',
          payload: this.lastEvent().payload
        }
      };
      fetchMovieDetails(this.lastEvent().payload).then(
        details =>
          this.request({
            type: 'fetchMovieDetailsSuccess',
            payload: details
          })
      );
    }
  },
  function*() {
    while (true) {
      yield { wait: 'fetchMovieDetailsSuccess' };
      yield {
        request: {
          type: 'updateMoviePage',
          payload: this.lastEvent().payload
        }
      };
    }
  },
  function*() {
    while (true) {
      yield { wait: 'CLICKED_MOVIE' };
      yield {
        request: {
          type: 'fetchMovieReviews',
          payload: this.lastEvent().payload
        }
      };
      fetchMovieReviews(this.lastEvent().payload).then(
        reviews => {
          this.request({
            type: 'fetchMovieReviewsSuccess',
            payload: reviews
          });
        }
      );
    }
  },
  function*() {
    while (true) {
      yield { wait: 'fetchMovieReviewsSuccess' };
      yield {
        request: {
          type: 'updateReviews',
          payload: this.lastEvent().payload
        }
      };
    }
  }
];
