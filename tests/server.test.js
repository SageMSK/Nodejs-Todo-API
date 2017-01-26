const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const app = require('../server');
const Todo = require('../models/todo');
const { todos, populateTodos } = require('./seed/seed');

beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'test todo text';

    request(app.app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then(todos => {
          expect(todos.length).toBe(1); // We added one item
          expect(todos[0].text).toBe(text);
          done();
        }).catch(e => done(e));
      });
  });

  it('should not create todo with invalid body data', done => {
    request(app.app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then(todos => {
          expect(todos.length).toBe(2);
          done();
        }).catch(e => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app.app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return the correct todo item with id', done => {
    request(app.app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done);
  });

  it('should return 404 if todo not found', done => {
    let randomHexId = new ObjectID();

    request(app.app)
      .get(`/todos/${randomHexId.toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', done => {
    // /todos/123
    request(app.app)
      .get(`/todos/123`)
      .expect(404)
      .end(done);
  });

});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', done => {
    let hexId = todos[1]._id.toHexString();
    request(app.app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexId)
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then(todo => {
          expect(todo).toNotExist();
          done();
        }).catch(e => done(e));
      });
  });

  it('should return 404 if todo not found', done => {
    let randomId = new ObjectID().toHexString();
    request(app.app)
      .delete(`/todos/${randomId}`)
      .expect(404)
      .end(done)
  });

  it('should return 404 if object id is invalid', done => {
    request(app.app)
      .delete(`/todos/1234`)
      .expect(404)
      .end(done)
  });

});

describe('PATCH /todos/:id', () => {
  it('should update the todo', done => {
    let todoHexId = todos[0]._id.toHexString();
    let newText = 'new text';
    request(app.app)
      .patch(`/todos/${todoHexId}`)
      .send({completed: true, text: newText})
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(newText);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  })

  it('should clear completedAt when todo is not completed', done => {
    let todoHexId = todos[1]._id.toHexString();
    request(app.app)
      .patch(`/todos/${todoHexId}`)
      .send({completed: false})
      .expect(200)
      .expect(res => {
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});