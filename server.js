require('dotenv').config()
const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const crypto = require("crypto");
const passportLocalMongoose  = require("passport-local-mongoose");
const session = require("express-session");
const ejs = require("ejs");
const sendmail = require(__dirname+"/mailer.js");
const _ = require('lodash');
const findOrCreate = require('mongoose-findorcreate');
const app = express();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
port = process.env.PORT || 3000;
app.use(bodyparser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  }));
app.use(passport.initialize());
app.use(passport.session());

const DB = process.env.DATABASE.replace('<PASSWORD>' , process.env.DATABASE_PASS);

mongoose.connect('mongodb://localhost:27017/UserDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);
const questionSchema= new mongoose.Schema({
  userPostedID:String,
  userPostedName:String,
  recentQuestion: String,
  answers: [{body: String , name: String}]
}) ;
const userSchema= new mongoose.Schema({
    password: String,
    name: String,
    resetToken: String,
    question: [questionSchema],
    resetToken:String,
    expirytime:Date,
}) ;

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model("user", userSchema); //MODEL OF THE SCHEMA
const userQuestions = new mongoose.model("question", questionSchema); //MODEL OF THE  QUESTIONSCHEMA

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT ,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ,
  callbackURL: "http://localhost:3000/auth/google/secret",
  // userProfileURL: "http://googleapis.com/oauth2/v3/userinfo"

},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ username: profile.id , name:profile.displayName}, function (err, user) {
    return cb(err, user);
  });
}
));

const testarray=[];


// THIS BLOCK HANDLES THE HOMEPAGE
app.get("/", function(req,res){
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
/////////////////////////////////////////////////////////////

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/secret', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secret');
});

// THIS BLOCK HANDLES THE LOGIN
app.get("/login", function(req,res){
    res.render("login");
});
app.get("/register", function(req,res){
 res.render("register");
});
app.post("/login", function(req,res){
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


// THIS BLOCK HANDLES THE PROFILE(SECRET)
app.get("/secret", function(req,res){
  if(req.isAuthenticated()){
    userQuestions.find({}, function(err, result){
      res.render("secret",{name:req.user.name, hello:result});
    });
  }
  else{
    res.redirect("login");
  }
});
//////////////////////////////////////////////////////////////////////


// THIS BLOCK HANDLES THE REGISTRATION
app.post("/register",function(req,res){
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
//////////////////////////////////////////////////////////////////////////////

app.get("/askquestion" , function(req,res){
  if(req.isAuthenticated()){
    res.render("askquestion");
  }
  else{
    res.redirect("/login");
  }
});
/////////////////////////////////////////////////////////////////
app.get('/send',function(req,res){
  sendmail();
})

// THIS BLOCK HANDLES THE LOGOUT
app.get("/logout", function(req,res){
  req.logOut();
  res.redirect("/");
});
////////////////////////////////////////////////////////////////


app.get("/resetpassword", function(req,res){
 res.render("reset",{err:''});
});

app.post("/resetpassword", function(req,res){
  const email= req.body.EMAIL;
  const reset = crypto.randomBytes(32).toString('hex');
  const message = 'Please copy this link to browser to rest your password '+ req.protocol+'://'+req.hostname+':'+port+'/reset/'+reset+'   '+'link is valid for 15minutes';
  User.findOne({username:email}, function(err,found){
    if(found===null){
      res.render("reset",{err:"Email Id not found please trying again"});
    }
    else{
    found.resetToken= crypto.createHash('sha256').update(reset).digest('hex');
    found.expirytime = Date.now()+15*60*1000;
    found.save();
    sendmail({
      Email:email,
      BODY:message,
    });
    res.render("sendsuccessful",{mail:email});
  }
  });
});

app.get("/reset/:token", function(req,res){
  const checkingTokens = crypto.createHash('sha256').update(req.params.token).digest('hex');
  User.findOne({resetToken:checkingTokens}, function(err,userfound){
    res.render('passwordwindow',{userid:userfound.id});
  });
 });

 app.post("/resetpass", function(req,res){
  const PASS =req.body.newpass;
  User.findOne({id:req.body.name, expirytime: { $gt: Date.now()}}, function(err,user){
    if(!user){
      res.render("passwordwindow");
    }
    else{
              user.setPassword(PASS, function(){
              user.resetToken = undefined;
              user.expirytime = undefined;
              user.save(function(err){
              console.log(err);
                res.redirect("/secret");
        });
    });
  }
  });
 });
app.post("/askquestion" , function(req,res){
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
app.post("/postanswer", function(req,res){
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
// THIS BLOCK HANDLES THE DYNAMIC ROUTING
app.get('/question/:questionName', function (req, res) {
  const quesName =  (req.params.questionName)+'?';
  console.log(quesName);
  userQuestions.find({},function(err, result){
      result.forEach(function(post){
          const stored= (post.recentQuestion);
          if(stored === quesName){
              res.render("questiontemplate",{question:post.recentQuestion, ids:post.id , answers:post.answers});
          }
      });
  });
});
//////////////////////////////////////////////////////////////////////////////////////////////////

// THIS BLOCK WILL HANDLE THE TOURING FROM PROFILE SECTION TO ANSWERS

// app.get('/profile/:questionName', function (req, res) {
//   const quesName =  (req.params.questionName)+'?';
//   console.log(quesName);
//   userQuestions.find({},function(err, result){
//       result.forEach(function(post){
//           const stored= (post.recentQuestion);
//           if(stored === quesName){
//               res.render("questiontemplate",{question:post.recentQuestion, ids:post.id , answers:post.answers});
//           }
//       });
//   });
// });
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// THIS BLOCK IS PROFILE
app.get('/profile' , function(req,res){
  if(req.isAuthenticated()){
    res.render("profile",{username: req.user.name, hello: req.user.question});
  }
  else{
    res.redirect("/login");
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(port,function(req,res){
    console.log("Server started at port 3000");
})
/////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/searchquery" , function(req,res){
userQuestions.find({ recentQuestion: { $regex: req.body.questionn } }, function(err, docs) {
  if(req.isAuthenticated()){
      res.render("searchprofile",{name:req.user.name, hello:docs});
  }
  else{
    res.render("search",{ hello:docs});
  }

    });
});
