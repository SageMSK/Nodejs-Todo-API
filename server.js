require('./config/config.js');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const todoRouter = require('./routes/todoRouter');
const userRouter = require('./routes/userRouter');

const app = express();
const PORT = process.env.PORT;

// cors: need this to use local data with react/redux front end dev
app.use(cors());
app.use(bodyParser.json());

app.use('/todos', todoRouter);
app.use('/users', userRouter);

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error: '));
db.once('open', () => {
  console.log('Connected correctly to MongoDB server!');
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

module.exports = {app};