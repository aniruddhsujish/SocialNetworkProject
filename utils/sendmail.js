const nodemailer = require('nodemailer');

module.exports.send = function(to, subject, text)
{
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport(
        {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // secure:true for port 465, secure:false for port 587
        auth: 
        {
            user: 'aloha.confirmation@gmail.com',
            pass: 'iamsoamazing'
        }
    });
    
    // setup email data with unicode symbols
    let mailOptions = 
    {
        from: '"Aloha" <aloha.confirmation@gmail.com>', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        //text: text, // plain text body
        
        html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head><body><img src="https://i.ibb.co/g953xvm/ig2.jpg" usemap="#image-map"><map name="image-map"><area target="_blank" alt="" title="" href="http://localhost:3900/verifypassword?id='+text+'" coords="165,438,432,473" shape="rect"><area target="_blank" alt="" title="" href="" coords="192,599,248,622" shape="rect"></map></body></html>'
    };
    
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => 
    {
        if (error) 
        {
            return console.log(error);
        }
        //console.log('Message %s sent: %s', info.messageId, info.response);
        console.log('Reset password email sent');
    });
}