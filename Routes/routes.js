const express = require("express");
const router= new express.Router();
const passport = require("passport");
const QueSchemaInput = require('../Models/questionSchema.js');

const userQuestions = QueSchemaInput.userQue; //MODEL OF THE  QUESTIONSCHEMA

router.get("/", function(req,res){
    if(req.isAuthenticated()){
       // res.render("secret",{name:req.user.name , hello:testarray});
       res.redirect("/secret")
   }
   else{
     userQuestions.find({}, function(err, result){
       res.render("index",{ hello:result});
     });
   }
 });

 router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

router.get('/auth/google/secret', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secret');
});
// THIS BLOCK HANDLES THE PROFILE(SECRET)
router.get("/secret", function(req,res){
  if(req.isAuthenticated()){
    userQuestions.find({}, function(err, result){
      res.render("secret",{name:req.user.name, hello:result});
    });
  }
  else{
    res.redirect("login");
  }
});
// THIS BLOCK IS PROFILE
router.get('/profile' , function(req,res){
  if(req.isAuthenticated()){
    res.render("profile",{username: req.user.name, hello: req.user.question});
  }
  else{
    res.redirect("/login");
  }
});

module.exports = router;