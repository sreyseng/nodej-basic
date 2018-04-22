const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server.js');
const { Todo } = require('./../models/todo.js');

const todosSeedData = [{
  _id: new ObjectID(),
  text: 'First todo'
}, {
  _id: new ObjectID(),
  text: 'Second todo'
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    Todo.insertMany(todosSeedData);
  }).then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    const text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({ text }).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((err) => {
          done(err);
        });
      });
  });

  it('should not create a new todo', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => {
          done(e);
        });
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return a todo', (done) => {
    request(app)
      .get(`/todos/${todosSeedData[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todosSeedData[0].text);
      })
      .end(done);
  });

  it('should return 404 if invalid id', (done) => {
    request(app)
      .get('/todos/invalidid123')
      .expect(404)
      .end(done);
  });

  it('should return 404 if id not found', (done) => {
    const randomId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${randomId}}`)
      .expect(404)
      .end(done);
  });
});
