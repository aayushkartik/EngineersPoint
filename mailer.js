require('dotenv').config()
const nodemailer = require("nodemailer");

const mail = options => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 465,
        secure: true,
        auth: {
          user: process.env.API_NAME,
          pass: process.env.API_PASS
        },
      });
      var mailoptions = {
          from: process.env.EMAIL,
          to: options.Email,
          subject: 'Password reset link',
          text: options.BODY
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

