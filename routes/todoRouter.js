const express = require('express');
const _ = require('lodash');
const { ObjectID } = require('mongodb');

const todoRouter = express.Router();
const Todo = require('./../models/todo');
const authenticate = require('./../middleware/authenticate');

todoRouter.post('/', authenticate, (req, res) => {
  let todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then(doc => {
    res.json(doc);
  }, err => {
    res.status(400).json(err);
  });
});

todoRouter.get('/', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.json({ todos });
  }, err => {
    res.status(400).json(err);
  });
});

todoRouter.get('/:id', authenticate, (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    res.status(404).json({ message: "Todo id is not valid. Please input the correct id." });
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then(todo => {
    if (!todo) {
      return res.status(404).json({ message: "Unable to find todo document." });
    }

    res.json({todo});
  }).catch(err => {
    res.status(400).json(err);
  });

});

todoRouter.delete('/:id', authenticate, (req, res) => {
  let id = req.params.id;

  if(!ObjectID.isValid(id)) {
    return res.status(404).json({ message: "Todo id is not valid. Please input the correct id." });
  }

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then(todo => {
    if (!todo) {
      return res.status(404).json({ message: "Todo doesn't exist or has been deleted." });
    }

    res.json({ todo, message: 'Todo successfully deleted.' });
  }).catch(err => {
    res.status(400).json(err);
  });
});

todoRouter.patch('/:id', authenticate, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).json({ message: "Todo id is not valid. Please input the correct id." });
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({ _id: id, _creator: req.user._id} , {$set: body}, {new: true}).then(todo => {
    if (!todo) {
      return res.status(404).json({ message: "Todo doesn't exist" });
    }

    res.json({ todo });
  }).catch(err => res.status(400).json(err));
});

module.exports = todoRouter;