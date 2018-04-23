const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { todosSeedData, populateTodos, usersSeedData, populateUsers } = require('./seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

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

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    const id = todosSeedData[0]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(id);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((e) => {
          done(e);
        });
      });
  });

  it('should return 404 on todo not found', (done) => {
    const id = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if invalid id for deletion', (done) => {
    request(app)
      .delete('/todos/invalidid')
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {

  it('should update the todo', (done) => {
    const id = todosSeedData[0]._id.toHexString();
    const body = { text: 'Updated text', completed: true };

    request(app)
      .patch(`/todos/${id}`)
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(body.text);
        expect(res.body.todo.completed).toBeTruthy();
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  });

  it('shoud clear completed', (done) => {
    const id = todosSeedData[1]._id.toHexString();
    const body = { text: 'Updated text', completed: false };

    request(app)
      .patch(`/todos/${id}`)
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(body.text);
        expect(res.body.todo.completed).toBeFalsy();
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', usersSeedData[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.user._id).toBe(usersSeedData[0]._id.toHexString());
        expect(res.body.user.email).toBe(usersSeedData[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    const email = 'test3@noreply.com';
    const password = 'test3pass';

    request(app)
      .post('/users')
      .send({ email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body.user._id).toExist();
        expect(res.body.user.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({ email }).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        }).catch(e => done(e));
      });
  });

  it('should return errors if invalid', (done) => {
    const email = 'invalidemail.com';
    const password = 'test3pass';
    const errMessage = `${email} is not a valid email`;

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('Unable to save user.');
        expect(res.body.stackTrace.errors.email.message).toBe(errMessage);
      })
      .end(done);
  });

  it('should not create user if email exist', (done) => {
    const { email } = usersSeedData[0];
    const password = 'test3pass';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('Unable to save user.');
        expect(res.body.stackTrace.code).toBe(11000); // dup key
      })
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login', (done) => {
    const { _id, email, password } = usersSeedData[1];
    request(app)
      .post('/users/login')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body.user._id).toEqual(_id.toHexString());
        expect(res.body.user.email).toEqual(email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(_id).then((user) => {
          expect(user.tokens[0]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch(e => done(e));
      });
  });

  it('should fail login', (done) => {
    const { _id, email } = usersSeedData[1];

    request(app)
      .post('/users/login')
      .send({ email, password: 'badpass' })
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(_id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch(e => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    const { _id } = usersSeedData[0];
    const { token } = usersSeedData[0].tokens[0];

    request(app)
      .delete('/users/me/token')
      .set('x-auth', token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(_id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch(e => done(e));
      });
  });
});
