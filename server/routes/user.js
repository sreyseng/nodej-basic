const express = require('express');
const router = express.Router();

const _ = require('lodash');
const { mongoose } = require('./../db/mongoose');

const { authenticate } = require('./../middleware/authenticate');
const { User } = require('./../models/user');

router.post('/', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  const user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send({ user });
  }).catch((e) => {
    res.status(400).send({ error: 'Unable to save user.', stackTrace: e });
  });
});

router.get('/me', authenticate, (req, res) => {
  const { user } = req;
  res.send({ user });
});

router.post('/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send({ user });
    });
  }).catch((err) => {
    res.status(401).send(err);
  });
});

router.delete('/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

module.exports = router;
