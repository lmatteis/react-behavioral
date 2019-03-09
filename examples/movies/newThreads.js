const cache = {};
export default [
  // Don't request IndexPage everytime
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
  // Don't request moviedetails every time
  function*() {
    yield { wait: 'fetchMoviesSuccess' };
    const { payload } = this.lastEvent();
    // create a thread for each movie that caches its requests
    payload.forEach(movie => {
      this.bp.addBThread('', 1, function*() {
        yield {
          wait: e =>
            e.type === 'fetchMovieDetailsSuccess' &&
            e.payload.id === movie.id
        };
        cache[movie.id] = this.lastEvent().payload;
        yield {
          block: e =>
            e.type === 'fetchMovieDetails' &&
            e.payload === movie.id
        };
      });
      this.bp.addBThread('', 1, function*() {
        while (true) {
          yield {
            wait: e =>
              e.type === 'CLICKED_MOVIE' &&
              e.payload === movie.id
          };
          yield { wait: 'renderedMoviePage' };
          if (cache[movie.id]) {
            yield {
              request: {
                type: 'updateMoviePage',
                payload: cache[movie.id]
              }
            };
          }
        }
      });
    });
  }
];
