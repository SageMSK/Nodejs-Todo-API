const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');
const Todo = require('./../../models/todo');
const User = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
  {
    _id: userOneId,
    email: 'johndoe@ex.com',
    password: 'password',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: 'janedoe@ex.com',
    password: '123abc'
  }
];

const todos = [{
  _id: new ObjectID(),
  text: 'first test',
  completed: false,
  completedAt: null
}, {
  _id: new ObjectID(),
  text: 'second test',
  completed: false,
  completedAt: null
}];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    let userOne = new User(users[0]).save();

    let userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = {
  todos,
  users,
  populateTodos,
  populateUsers
};