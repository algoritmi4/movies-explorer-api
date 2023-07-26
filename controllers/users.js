const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

const ConflictError = require('../customErrors/ConflictError');
const NotFoundError = require('../customErrors/NotFoundError');

function login(req, res, next) {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'key', { expiresIn: '7d' });

      res.cookie('jwt', token, {
        maxAge: 604800000,
        httpOnly: true,
        sameSite: true,
      });

      return res.status(200).send({ data: user });
    })
    .catch(next);
}

const signOut = (req, res) => res.status(200).clearCookie('jwt').send({ message: 'jwt успешно удален' });

function createUser(req, res, next) {
  const { name, email, password } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({ name, email, password: hash })
        .then((user) => res.status(201).send({ data: user }))
        .catch((err) => {
          if (err.code === 11000) {
            next(new ConflictError('Пользователь с таким email уже существует'));
            return;
          }

          next(err);
        });
    })
    .catch(next);
}

function getCurrentUser(req, res, next) {
  User.findById(req.user._id)
    .orFail(new NotFoundError('Пользователь с указанным id не найден'))
    .then((user) => res.status(200).send({ data: user }))
    .catch(next);
}

function updateCurrentUser(req, res, next) {
  const { name, email } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .then((user) => res.status(201).send({ data: user }))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Пользователь с таким email уже существует'));
        return;
      }

      if (err.name === 'CastError') {
        next(new NotFoundError('Пользователь с указанным id не найден'));
        return;
      }

      next(err);
    });
}

module.exports = {
  getCurrentUser, updateCurrentUser, login, createUser, signOut,
};
