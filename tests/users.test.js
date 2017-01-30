const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const app = require('../server');
const User = require('../models/user');
const { users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);

describe('GET /users/me (secure)', () => {
  it('should return user if authenticated', done => {
    request(app.app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', done => {
    request(app.app)
      .get('/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', done => {
    let email = 'example@ex.com';
    let password = 'password123';
    
    request(app.app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end(err => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then(user => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        }).catch(err => done(err));
      });
  });

  it('should return validation errors if request is invalid', done => {
    request(app.app)
      .post('/users')
      .send({email: 'asdf', password: 'password'})
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', done => {
    let email = users[0].email;
    let password = 'password123';

    request(app.app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', done => {
    request(app.app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then(user => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch(e => done(e));
      })

  });

  it('should reject invalid login', done => {
    request(app.app)
      .post('/users/login')
      .send({
        email: 'asdf@ex.com',
        password: 'asdfasdfads'
      })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then(user => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch(e => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', done => {
    // DELETE /users/me/token
    request(app.app)
      .delete('/users/me/token')
      // Set x-auth  equal to token
      .set('x-auth', users[0].tokens[0].token)
      // expect 200
      .expect(200)
      // add end() call
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        // find user, verify that token array has length of zero
        User.findById({_id: users[0]._id}).then(user => {
          expect(user.tokens[0]).toNotExist();
          done();
        }).catch(e => done(e));
    })
  });
})