const { ObjectID } = require('mongodb');

const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose.js');
const { Todo } = require('./models/todo.js');

const app = express();

const port = process.env.PORT || 3000;

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

app.listen(port, () => {
  console.info(`Server started on port ${port}`);
});

module.exports = {
  app
};
