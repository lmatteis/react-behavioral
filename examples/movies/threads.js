import {
  fetchMovies,
  fetchMovieDetails,
  fetchMovieReviews
} from './api';

let lastScrollY = 0;

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
        },
        wait: 'CLICKED_BACK'
      };
    }
  },
  function*() {
    while (true) {
      yield { wait: 'fetchMovieDetails' };
      fetchMovieDetails(this.lastEvent().payload).then(
        details => {
          this.bp.addBThread('', 1, function*() {
            yield {
              request: {
                type: 'fetchMovieDetailsSuccess',
                payload: details
              }
            };
          });
          this.bp.run();
        }
      );
    }
  },
  function*() {
    while (true) {
      yield { wait: 'CLICKED_MOVIE' };
      let movieId = this.lastEvent().payload;
      yield {
        wait: [
          e =>
            e.type === 'fetchMovieDetailsSuccess' &&
            e.payload.id === movieId,
          'CLICKED_BACK',
          'CLICKED_MOVIE'
        ]
      };
      if (this.lastEvent().type === 'CLICKED_MOVIE') {
        while (true) {
          movieId = this.lastEvent().payload;
          console.log('enter new while', movieId);
          yield {
            wait: [
              e =>
                e.type === 'fetchMovieDetailsSuccess' &&
                e.payload.id === movieId,
              'CLICKED_MOVIE'
            ]
          };
          if (this.lastEvent().type === 'CLICKED_MOVIE') {
            continue;
          } else {
            break;
          }
        }
      }
      if (this.lastEvent().type === 'CLICKED_BACK') {
        continue;
      }

      yield {
        request: {
          type: 'updateMoviePage',
          payload: this.lastEvent().payload
        }
      };
    }
  },
  // function*() {
  //   while (true) {
  //     yield { wait: 'updateMoviePage' };
  //     window.scrollTo(0, 0);
  //   }
  // },
  // function*() {
  //   while (true) {
  //     yield { wait: 'fetchMovieDetailsSuccess' };
  //     lastScrollY = window.scrollY;
  //   }
  // },
  // function*() {
  //   while (true) {
  //     yield { wait: 'indexPageMoviesLoaded' };
  //     window.scrollTo(0, lastScrollY);
  //   }
  // },
  function*() {
    while (true) {
      const { payload } = yield { wait: 'updateMoviePage' };
      yield { wait: 'renderedIndexPage' };
      yield {
        request: { type: 'highlightMovie', payload }
      };
    }
  },
  // function*() {
  //   while (true) {
  //     yield { wait: 'CLICKED_MOVIE' };
  //     yield {
  //       request: {
  //         type: 'fetchMovieReviews',
  //         payload: this.lastEvent().payload
  //       }
  //     };
  //     fetchMovieReviews(this.lastEvent().payload).then(
  //       reviews => {
  //         this.request({
  //           type: 'fetchMovieReviewsSuccess',
  //           payload: reviews
  //         });
  //       }
  //     );
  //   }
  // },
  // function*() {
  //   while (true) {
  //     yield { wait: 'fetchMovieReviewsSuccess' };
  //     yield {
  //       request: {
  //         type: 'updateReviews',
  //         payload: this.lastEvent().payload
  //       }
  //     };
  //   }
  // }
  function*() {
    while (true) {
      yield { wait: 'renderedMoviePage' };
      yield { wait: 'updateMoviePage' };
      yield { request: 'scrollTopTop' };
      window.scrollTo(0, 0);
    }
  },
  function*() {
    let lastScrollY;
    while (true) {
      yield { wait: 'CLICKED_MOVIE' };
      lastScrollY = window.scrollY;
      yield { wait: 'CLICKED_BACK' };
      yield { wait: 'indexPageMoviesLoaded' };
      yield { request: 'setScrollYonIndexPage' };
      window.scrollTo(0, lastScrollY);
    }
  },
  function*() {
    let highlightMovieIds = [];
    while (true) {
      const { payload } = yield {
        wait: 'fetchMovieDetailsSuccess'
      };
      highlightMovieIds.push(payload.id);
      yield {
        request: {
          type: 'highlightMovieIds',
          payload: highlightMovieIds
        }
      };
    }
  },
  function*() {
    let highlightMovieIds = [];
    while (true) {
      const { payload } = yield {
        wait: ['highlightMovieIds', 'CLICKED_BACK']
      };
      if (this.lastEvent().type === 'highlightMovieIds') {
        highlightMovieIds = payload;
      }
      yield { wait: 'renderedIndexPage' };
      yield {
        request: {
          type: 'highlightMovieIds',
          payload: highlightMovieIds
        }
      };
    }
  }
];
