require('./config/config');

const _ = require('lodash');
const { ObjectID } = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

const todoRouter = require('./routes/todo');
const userRouter = require('./routes/user');

const app = express();

app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

app.use((req, res, next) => {
  const now = new Date().toString();
  const log = `${now}: ${req.method} ${req.url}}`;

  console.info(log);

  if (req.apiGateway) {
    console.info("api gateway: " + JSON.stringify(req.apiGateway.event, undefined, 2));
  }

  next();
});

app.use('/todos', todoRouter);
app.use('/users', userRouter);

app.get('/ping', (req, res) => {
  res.send({ body: 'pong' });
});

module.exports = {
  app
};
