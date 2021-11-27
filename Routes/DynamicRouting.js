const express = require("express");
const router= new express.Router();
const QueSchemaInput = require('../Models/questionSchema.js');

const userQuestions = QueSchemaInput.userQue; //MODEL OF THE  QUESTIONSCHEMA
router.get('/question/:questionName', function (req, res) {
    const quesName =  (req.params.questionName)+'?';
    userQuestions.find({},function(err, result){
        result.forEach(function(post){
            if(post.recentQuestion === quesName){
                res.render("questiontemplate",{question:post.recentQuestion, ids:post.id , answers:post.answers});
            }
        });
    });
  });

module.exports= router;