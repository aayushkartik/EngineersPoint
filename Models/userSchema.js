const mongoose= require('mongoose');
const passportLocalMongoose  = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const QueSchemaInput = require('./questionSchema.js');
const userSchema= new mongoose.Schema({
    password: String,
    name: String,
    resetToken: String,
    question: [QueSchemaInput.questionSchema],
    resetToken:String,
    expirytime:Date,
}) ;
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model("user", userSchema);
module.exports = User;