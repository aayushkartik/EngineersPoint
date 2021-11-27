const mongoose= require('mongoose');
const questionSchema= new mongoose.Schema({
    userPostedID:String,
    userPostedName:String,
    recentQuestion: String,
    answers: [{body: String , name: String}],
  }) ;
const userQue = new mongoose.model("question", questionSchema); //MODEL OF THE  QUESTIONSCHEMA
module.exports = {userQue:userQue, questionSchema: questionSchema};