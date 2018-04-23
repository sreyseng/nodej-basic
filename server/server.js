require('./config/config');

const _ = require('lodash');
const { ObjectID } = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const app = express();

const port = process.env.PORT;

app.use(bodyParser.json());

app.use((req, res, next) => {
  const now = new Date().toString();
  const log = `${now}: ${req.method} ${req.url}}`;

  console.info(log);
  next();
});

app.post('/todos', authenticate, (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (err) => {
    res.status(400).send(err);
  });
});

app.post('/users', (req, res) => {
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

app.get('/users/me', authenticate, (req, res) => {
  const { user } = req;
  res.send({ user });
});

app.post('/users/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send({ user });
    });
  }).catch((err) => {
    res.status(401).send(err);
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({ _creator: req.user._id }).then((todos) => {
    res.send({ todos });
  }, (err) => {
    res.status(400).send(err);
  });
});

app.get('/todos/:id', authenticate, (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({ error: 'Invalid Id.' });
  }

  Todo.findOne({ _id: id, _creator: req.user._id}).then((todo) => {
    if (!todo) {
      return res.status(404).send({ error: 'Todo not found.' });
    }

    res.send({ todo });
  }).catch((err) => {
    res.status(400).send({ error: 'An unexpected error occured.' });
  });
});

app.delete('/todos/:id', authenticate, (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({ error: 'Invalid Id.' });
  }

  Todo.findOneAndRemove({ _id: id, _creator: req.user._id }).then((todo) => {
    if (!todo) {
      return res.status(404).send({ error: 'Todo not found.' });
    }

    res.send({ todo });
  }).catch((err) => {
    res.status(400).send({ error: 'An unexpected error occured.' });
  });
});

app.patch('/todos/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const toUpdate = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({ error: 'Invalid Id.' });
  }

  if (_.isBoolean(toUpdate.completed) && toUpdate.completed) {
    toUpdate.completedAt = new Date().getTime();
  } else {
    toUpdate.completed = false;
    toUpdate.completedAt = null;
  }

  Todo.findOneAndUpdate({ _id: id, _creator: req.user._id }, { $set: toUpdate }, { new: true })
    .then((todo) => {
      if (!todo) {
        return res.status(404).send('Todo not found.');
      }

      res.send({ todo });
    }).catch((e) => {
      res.status(400).send({ error: 'An unepected error occured.', stackTrace: e });
    });
});


app.listen(port, () => {
  console.info(`Server started on port ${port}`);
});

module.exports = {
  app
};
