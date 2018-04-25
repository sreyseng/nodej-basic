const express = require('express');
const router = express.Router();

const _ = require('lodash');
const { mongoose } = require('./../db/mongoose');

const { authenticate } = require('./../middleware/authenticate');
const { Todo } = require('./../models/todo');
const { ObjectID } = require('mongodb');

router.post('/', authenticate, (req, res) => {
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

router.get('/', authenticate, (req, res) => {
  Todo.find({ _creator: req.user._id }).then((todos) => {
    res.send({ todos });
  }, (err) => {
    res.status(400).send(err);
  });
});

router.get('/:id', authenticate, (req, res) => {
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

router.delete('/:id', authenticate, (req, res) => {
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

router.patch('/:id', authenticate, (req, res) => {
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

module.exports = router;
