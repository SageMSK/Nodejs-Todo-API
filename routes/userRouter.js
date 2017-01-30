const express = require('express');
const _ = require('lodash');
const { ObjectID } = require('mongodb');

const userRouter = express.Router();
const User = require('./../models/user');
const authenticate = require('./../middleware/authenticate');

userRouter.post('/', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);
  let newUser = new User(body);

  newUser.save().then(() => {
    return newUser.generateAuthToken();
  }).then(token => {
    res.header('x-auth', token).send(newUser);
  }).catch(e => res.status(400).send(e));
});

userRouter.get('/', (req, res) => {
  User.find().then(users => {
    res.send({users});
  }).catch(e => res.status(400).send(e));
});

userRouter.get('/me', authenticate, (req,res) => {
  res.send(req.user);
});

userRouter.post('/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then(user => {
    user.generateAuthToken().then(token => {
      res.header('x-auth', token).send(user);
    })
  }).catch(err => res.status(400).send(err));
});

userRouter.delete('/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }).catch(e => res.status(400).send(e));
})

module.exports = userRouter;