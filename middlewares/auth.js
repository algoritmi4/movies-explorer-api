const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;

const UnauthorizedError = require('../customErrors/UnauthorizedError');

const handleAuthError = (next) => {
  next(new UnauthorizedError('Ошибка верификации токена'));
};

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'key');
  } catch {
    handleAuthError(next);
    return;
  }

  req.user = payload;

  next();
};
