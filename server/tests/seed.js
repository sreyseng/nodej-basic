const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');

const test1Id = new ObjectID();
const test2Id = new ObjectID();
const usersSeedData = [{
  _id: test1Id,
  email: 'test1@example.com',
  password: 'test1pass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: test1Id, access: 'auth' }, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: test2Id,
  email: 'test2@example.com',
  password: 'test2pass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: test2Id, access: 'auth' }, process.env.JWT_SECRET).toString()
  }]
}];

const todosSeedData = [{
  _id: new ObjectID(),
  text: 'First todo',
  _creator: test1Id
}, {
  _id: new ObjectID(),
  text: 'Second todo',
  completed: true,
  completedAt: 123,
  _creator: test2Id
}];

const populateUsers = (done) => {
  User.remove({}).then(() => {
    const userOne = new User(usersSeedData[0]).save();
    const userTwo = new User(usersSeedData[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    Todo.insertMany(todosSeedData);
  }).then(() => done());
};

module.exports = {
  todosSeedData,
  usersSeedData,
  populateTodos,
  populateUsers
};
