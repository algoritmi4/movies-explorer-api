const router = require('express').Router();

const { celebrate, Joi } = require('celebrate');

const { getSavedMoovies, createMovie, deleteMovie } = require('../controllers/movies');

const { getCurrentUser, updateCurrentUser } = require('../controllers/users');

const RegularURL = require('../utils/RegularURL');

router.get('/users/me', getCurrentUser);
router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required().min(2).max(30),
  }),
}), updateCurrentUser);

router.get('/movies', getSavedMoovies);
router.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().pattern(RegularURL),
    trailerLink: Joi.string().required().pattern(RegularURL),
    thumbnail: Joi.string().required().pattern(RegularURL),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovie);
router.delete('/movies/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),
}), deleteMovie);

module.exports = router;
