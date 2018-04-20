var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
  sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},//{type: String, required: true},
  receiver: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},//{type: String, required: true},  
  message: String,
  subject: String,
  read: { type: Boolean, default: false},
  createdAt: { type: Date,default: Date.now}
}, { collection: 'messages' });


module.exports = mongoose.model('Message', MessageSchema, 'messages');