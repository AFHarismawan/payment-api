var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: {
    type: String,
    required: 'Please enter name'
  },
  phone: {
    type: String,
    required: 'Please enter phone',
    index: { unique: true }
  },
  email: {
    type: String,
    required: 'Please enter email',
    index: { unique: true }
  },
  password: {
    type: String,
    required: 'Please enter password'
  },
  transactions: [
    { value: Number, date: Date }
  ]
});

module.exports = mongoose.model('user', UserSchema);