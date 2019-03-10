const cache = {};
export default [
  // Don't request IndexPage every time
  function*() {
    yield { wait: 'fetchMoviesSuccess' };
    yield { block: 'fetchMovies' };
  },
  function*() {
    yield { wait: 'fetchMoviesSuccess' };
    const movies = this.lastEvent().payload;

    while (true) {
      yield { wait: 'CLICKED_BACK' };
      yield { wait: 'renderedIndexPage' };
      yield {
        request: {
          type: 'updateIndexPage',
          payload: movies
        }
      };
    }
  },
  // Don't request movie details every time
  function*() {
    while (true) {
      yield { wait: 'fetchMovieDetailsSuccess' };
      const { id } = this.lastEvent().payload;
      // // create a thread for each movie that caches its requests
      this.bp.addBThread('', 1, function*() {
        cache[id] = this.lastEvent().payload;
        yield {
          block: e =>
            e.type === 'fetchMovieDetails' &&
            e.payload === id
        };
      });
    }
  },
  function*() {
    while (true) {
      yield { wait: 'renderedMoviePage' };
      const movieId = this.lastEvent().payload;

      if (cache[movieId]) {
        yield {
          request: {
            type: 'updateMoviePage',
            payload: cache[movieId]
          }
        };
      }
    }
  }
  // function*() {
  //   while (true) {
  //     yield { wait: 'renderedMoviePage' };
  //     yield {
  //       block: 'updateMoviePage',
  //       wait: 'updateReviews'
  //     };
  //   }
  // }
];
