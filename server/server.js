require('./config/config');

const _ = require('lodash');
const { ObjectID } = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const app = express();

const port = process.env.PORT;

app.use(bodyParser.json());

app.use((req, res, next) => {
  const now = new Date().toString();
  const log = `${now}: ${req.method} ${req.url}}`;

  console.info(log);
  next();
});

app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
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
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send({ error: 'Unable to save user.', stackTrace: e });
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({ todos });
  }, (err) => {
    res.status(400).send(err);
  });
});

app.get('/todos/:id', (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({ error: 'Invalid Id.' });
  }

  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send({ error: 'Todo not found.' });
    }

    res.send({ todo });
  }).catch((err) => {
    res.status(400).send({ error: 'An unexpected error occured.' });
  });
});

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({ error: 'Invalid Id.' });
  }

  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      return res.status(404).send({ error: 'Todo not found.' });
    }

    res.send({ todo });
  }).catch((err) => {
    res.status(400).send({ error: 'An unexpected error occured.' });
  });
});

app.patch('/todos/:id', (req, res) => {
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

  Todo.findByIdAndUpdate(id, { $set: toUpdate }, { new: true })
    .then((todo) => {
      if (!todo) {
        return res.status(400).send('Todo not found.');
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
