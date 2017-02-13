const express = require('express');
const _ = require('lodash');
const { ObjectID } = require('mongodb');

const userRouter = express.Router();
const User = require('./../models/user');
const authenticate = require('./../middleware/authenticate');

// Creating new user
userRouter.post('/', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);
  let newUser = new User(body);

  newUser.save().then(() => {
    return newUser.generateAuthToken();
  }).then(token => {
    // res.header('x-auth', token).json(newUser);
    res.header('x-auth', token).json({ token });
  }).catch(err => res.status(400).json({err, message: "Email already in use" }));
});

userRouter.get('/', (req, res) => {
  User.find().then(users => {
    res.json({users});
  }).catch(err => res.status(400).json(err));
});

userRouter.get('/me', authenticate, (req,res) => {
  res.json(req.token);
});

userRouter.post('/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then(user => {
    user.generateAuthToken().then(token => {
      // res.header('x-auth', token).json(user);
      res.header('x-auth', token).json({ token });
    })
  }).catch(err => res.status(400).json(err));
});

userRouter.delete('/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).json();
  }).catch(err => res.status(400).json(err));
});

module.exports = userRouter;