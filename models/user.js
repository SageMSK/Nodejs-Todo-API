const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    require: true,
    minlength: 1,
    trim: true
  }
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;