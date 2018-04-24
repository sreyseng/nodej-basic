require('./config/config');

const _ = require('lodash');
const { ObjectID } = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

const todoRouter = require('./routes/todo');
const userRouter = require('./routes/user');

const port = process.env.PORT;

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  const now = new Date().toString();
  const log = `${now}: ${req.method} ${req.url}}`;

  console.info(log);
  next();
});

app.use('/todos', todoRouter);
app.use('/users', userRouter);

app.listen(port, () => {
  console.info(`Server started on port ${port}`);
});

module.exports = {
  app
};
