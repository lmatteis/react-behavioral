import React from 'react';
import {
  fetchMovieDetails,
  fetchMovieReviews
} from '../api';
import Icon from './Icon';
import Spinner from './Spinner';
import './MoviePage.css';

import { connectProps } from '../../../src/react-behavioral';

// const movieDetailsFetcher = createResource(
//   fetchMovieDetails
// );
// const movieReviewsFetcher = createResource(
//   fetchMovieReviews
// );

function Rating({ label, score, icon }) {
  if (typeof score !== 'number' || score < 0) return null;
  return (
    <div className="Rating">
      <div className="small-title">{label}</div>
      {icon && (
        <div>
          <Icon type={icon} size="medium" />
        </div>
      )}
      <div className="rating-score">{score}%</div>
    </div>
  );
}

function MovieReview({ quote, critic }) {
  return (
    <div className="MovieReview box">
      <div>{quote}</div>
      <div className="sub-text">{critic.name}</div>
    </div>
  );
}

function MovieReviews({ movieId, reviews }) {
  return (
    <div className="MovieReviews">
      {reviews.map(review => (
        <MovieReview key={review.id} {...review} />
      ))}
    </div>
  );
}

function Img(props) {
  return <img {...props} src={props.src} />;
}

function MovieDetails(props) {
  const {
    movieId,
    ratingSummary = {},
    ratings = {},
    title,
    posters = {}
  } = props;

  return (
    <div className="MovieDetails">
      <div className="poster">
        <Img src={posters.detailed} alt="poster" />
      </div>
      <div className="details">
        <h1>{title}</h1>
        <div className="ratings">
          <Rating
            label="Tomatometer"
            score={ratings.critics_score}
            icon={ratings.critics_rating}
          />
          <Rating
            label="Audience"
            score={ratings.audience_score}
            icon={ratings.audience_rating}
          />
        </div>
        <div className="critic">
          <div className="small-title">
            Critics consensus
          </div>
          {ratingSummary.consensus}
        </div>
      </div>
    </div>
  );
}

// <Suspense maxDuration={500} fallback={<Spinner />}>
//   <MovieReviews movieId={movieId} />
// </Suspense>
function MoviePage({ movieId, ...rest }) {
  return (
    <React.Fragment>
      <MovieDetails movieId={movieId} {...rest} />
    </React.Fragment>
  );
}

const cache = {};
export default connectProps(
  function* cacheFetchMovieDetails() {
    if (cache[this.props.movieId]) {
      yield {
        block: event =>
          event.type === 'fetchMovieDetails' &&
          event.payload === this.props.movieId
      };
    } else {
      yield { wait: 'fetchMovieDetailsSuccess' };
      const details = this.lastEvent().payload;
      cache[details.id] = details;
    }
  },
  function*() {
    if (cache[this.props.movieId]) {
      yield {
        request: {
          type: 'fetchMovieDetailsSuccess',
          payload: cache[this.props.movieId]
        }
      };
    }
  },
  function*() {
    yield {
      request: {
        type: 'fetchMovieDetails',
        payload: this.props.movieId
      }
    };
    fetchMovieDetails(this.props.movieId).then(details =>
      this.request({
        type: 'fetchMovieDetailsSuccess',
        payload: details
      })
    );
  },
  function*() {
    yield { wait: 'fetchMovieDetailsSuccess' };
    const details = this.lastEvent().payload;
    this.setProps(details);
  }
)(MoviePage);
