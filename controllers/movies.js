/* eslint-disable object-property-newline */
const Movie = require('../models/movie');

const ForbiddenError = require('../customErrors/ForbiddenError');
const NotFoundError = require('../customErrors/NotFoundError');

function getSavedMoovies(req, res, next) {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.status(200).send({ data: movies }))
    .catch(next);
}

function createMovie(req, res, next) {
  const {
    country, director, duration,
    year, description, image,
    trailerLink, thumbnail, movieId,
    nameRU, nameEN,
  } = req.body;

  Movie.create({
    country, director, duration,
    year, description, image,
    trailerLink, thumbnail, movieId,
    nameRU, nameEN, owner: req.user._id,
  })
    .then((movie) => res.status(201).send({ data: movie }))
    .catch(next);
}

function deleteMovie(req, res, next) {
  Movie.findById(req.params.id)
    .orFail(new NotFoundError('Фильм с указанным id не найден'))
    .then((movie) => {
      // eslint-disable-next-line eqeqeq
      if (!(movie.owner == req.user._id)) {
        throw new ForbiddenError('Фильм не принадлежит пользователю');
      } else {
        Movie.deleteOne(movie)
          .then(() => res.status(200).send(movie))
          .catch(next);
      }
    })
    .catch(next);
}

module.exports = { getSavedMoovies, createMovie, deleteMovie };
