const express = require('express');

const mongoose = require('mongoose');

const cookieParser = require('cookie-parser');

const bodyParser = require('body-parser');

const helmet = require('helmet');

const cors = require('cors');

const { Joi, celebrate, errors } = require('celebrate');

require('dotenv').config();

const auth = require('./middlewares/auth');

const errorHandler = require('./middlewares/errorHandler');

const { requestLogger, errorLogger } = require('./middlewares/loggers');

const { login, createUser, signOut } = require('./controllers/users');

const limiter = require('./middlewares/limiter');

const NotFoundError = require('./customErrors/NotFoundError');

const { PORT = 3001, DB_URL = 'mongodb://0.0.0.0:27017/bitfilmsdb' } = process.env;

const app = express();

const whiteList = ['https://movies-finder.nomoreparties.sbs', 'http://localhost:3000'];

app.use(cors({ origin: whiteList, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

mongoose.connect(DB_URL);

app.use(requestLogger);
app.use(limiter);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.use('/signout', signOut);

app.use('/', auth, require('./routes/index'));

app.use('*', (req, res, next) => {
  next(new NotFoundError('Передан неправильный путь'));
});

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

app.listen(PORT);
