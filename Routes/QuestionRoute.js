const express= require('express');
const _ = require('lodash');
const QueSchemaInput = require('../Models/questionSchema.js');
const router= new express.Router();
const User=  require('../Models/userSchema.js');

const userQuestions = QueSchemaInput.userQue; //MODEL OF THE  QUESTIONSCHEMA

router.get("/askquestion" , function(req,res){
    if(req.isAuthenticated()){
      res.render("askquestion");
    }
    else{
      res.redirect("/login");
    }
  });
  ////////////////////////////////////////////////////////////////
  router.post("/askquestion" , function(req,res){
    const abcd = _.lowerCase(req.body.ques)+'?';
    userQuestions.find({recentQuestion:abcd},function(err, got){
      if(err){
        console.log(err);
      }
      else{
        if(got.length===0){
          const newquestion = new userQuestions({
            userPostedID: req.user.id,
            userPostedName: req.user.name,
            recentQuestion: abcd,
          });
          newquestion.save();
          console.log(newquestion);
          User.findById(req.user.id , function(err, founduser){
            if(err){
              console.log(err);
            }
            else{
              founduser.question.push(newquestion);
              founduser.save(function(){
                res.redirect("/")
              });
            }
          });
        }
        else{
          res.send("question already exist. Go back and try again")
        }
      }
    });
  });
  //THIS BLOCK HANDLE THE POSTING OF ANSWER
  router.post("/postanswer", function(req,res){
    if(req.isAuthenticated()){
      const ANS = req.body.ans;
      userQuestions.findById(req.body.idbutton, function(err,founduser){
        if(err){
          console.log(err);
        }
        else{
          founduser.answers.push({body:ANS, name:req.user.name});
          
          founduser.save(function(){
            res.redirect('/question/'+founduser.recentQuestion);
          });
        }
      });
    }
    else{
      res.redirect("/login");
    }
  });
  
  module.exports= router;