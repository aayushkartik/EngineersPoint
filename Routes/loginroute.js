const express = require("express");
const router= new express.Router();
const session = require("express-session");
const passport = require("passport");
const QueSchemaInput = require('../Models/questionSchema.js');
const User=  require('../Models/userSchema.js');

const userQuestions = QueSchemaInput.userQue; //MODEL OF THE  QUESTIONSCHEMA

// THIS BLOCK HANDLES THE LOGIN
router.get("/login", function(req,res){
    res.render("login");
});
router.get("/register", function(req,res){
 res.render("register");
});
router.post("/login", function(req,res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err){
    if(err){
      console.log(err);
    }
    else{
      passport.authenticate('local')(req,res, function(){
        res.redirect("/secret");
      });
    }
  });
});
////////////////////////////////////////////////////////////////////////
// THIS BLOCK HANDLES THE REGISTRATION
router.post("/register",function(req,res){
    console.log(testarray);
    User.register({username: req.body.username, name: req.body.name}, req.body.password,  function(err,user){
      if(err){
        console.log(err);
        res.redirect("/register");
      }
      else{
        passport.authenticate('local')(req,res, function(){
  
          res.redirect("/secret");
        });
      }
    });
  });
  // THIS BLOCK HANDLES THE LOGOUT
router.get("/logout", function(req,res){
    req.logOut();
    res.redirect("/");
  });



module.exports = router;