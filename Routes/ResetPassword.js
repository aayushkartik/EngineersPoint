const express = require("express");
const router= new express.Router();
const crypto = require("crypto");
const QueSchemaInput = require('../Models/questionSchema.js');
const User=  require('../Models/userSchema.js');
const sendmail = require("../mailer.js");
// const userQuestions = QueSchemaInput.userQue; //MODEL OF THE  QUESTIONSCHEMA


router.get("/resetpassword", function(req,res){
    res.render("reset",{err:''});
   });
   
router.post("/resetpassword", function(req,res){
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
   
router.get("/reset/:token", function(req,res){
    const checkingTokens = crypto.createHash('sha256').update(req.params.token).digest('hex');
    User.findOne({resetToken:checkingTokens}, function(err,userfound){
    res.render('passwordwindow',{userid:userfound.id});
    });
});

router.post("/resetpass", function(req,res){
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

module.exports= router;
