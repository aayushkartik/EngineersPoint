require('dotenv').config()
const nodemailer = require("nodemailer");

const mail = options => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 3000,
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASS
        },
      });
      var mailoptions = {
          from: process.env.EMAIL,
          to: options.email,
          subject: 'user login success',
          text: 'welcome to the the engineers portal'
      }

    transporter.sendMail(mailoptions, function(err,info){
        if(err){
            console.log('error occured', err);
        }
        else{
            console.log("email sent successfully")
        }
    });
}
module.exports=mail;

