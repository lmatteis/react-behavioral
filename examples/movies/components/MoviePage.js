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

function MovieReviews({ movieId, reviews = [], loading }) {
  if (loading) {
    return <Spinner />;
  }
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

const MovieReviewsContainer = connectProps(function*() {
  this.setProps({ loading: true });
  yield { wait: 'updateReviews' };
  this.setProps({
    loading: false,
    reviews: this.lastEvent().payload
  });
})(MovieReviews);

function MoviePage({ movieId, loading, ...rest }) {
  if (loading) {
    return <Spinner />;
  }
  return (
    <React.Fragment>
      <MovieDetails movieId={movieId} {...rest} />
    </React.Fragment>
  );
}

// <MovieReviewsContainer movieId={movieId} />
export default connectProps(function*() {
  yield {
    request: {
      type: 'renderedMoviePage',
      payload: this.props.movieId
    }
  };
  this.setProps({ loading: true });
  yield { wait: 'updateMoviePage' };
  const details = this.lastEvent().payload;
  this.setProps({ loading: false, ...details });
})(MoviePage);
