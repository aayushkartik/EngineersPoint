const express = require("express");
const QueSchemaInput = require('../Models/questionSchema.js');
const router= new express.Router();
const User=  require('../Models/userSchema.js');
const userQuestions = QueSchemaInput.userQue; //MODEL OF THE  QUESTIONSCHEMA

router.post("/searchquery" , function(req,res){
    userQuestions.find({ recentQuestion: { $regex: req.body.questionn } }, function(err, docs) {
      if(req.isAuthenticated()){
          res.render("search",{name:req.user.name, hello:docs, loginCheck:1});
      }
      else{
        res.render("search",{name:"none", hello:docs, loginCheck:0});
      }
        });
    });
module.exports= router;