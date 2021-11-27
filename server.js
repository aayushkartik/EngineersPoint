require('dotenv').config()
const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const User=  require(__dirname+ '/Models/userSchema.js');

const CustomRouter= require('./Routes/routes.js');
const CustomLoginRouter= require('./Routes/loginroute.js');
const CustomResetPasswordRouter= require('./Routes/ResetPassword.js');
const CustomDynamicRoutingRouter= require('./Routes/DynamicRouting.js');
const CustomQuestionRouter= require('./Routes/QuestionRoute.js');
const CustomQuerySearchRouter= require('./Routes/QuerySearchRoute.js');

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

app.use(CustomRouter);
app.use(CustomLoginRouter);
app.use(CustomResetPasswordRouter);
app.use(CustomDynamicRoutingRouter);
app.use(CustomQuestionRouter);
app.use(CustomQuerySearchRouter);

//////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(port,function(req,res){
    console.log("Server started at port 3000");
})
/////////////////////////////////////////////////////////////////////////////////////////////////