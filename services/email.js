'use strict';

const nodemailer = require('nodemailer');
const config = require("../config/config");
var emailMessage = require('../models/emailmessage');

// create reusable transporter object using the default SMTP transport
let smtpConfig = {
    host: config.email.hostname,    
    port: config.email.port,
    tls: {
        rejectUnauthorized: false
    }    
};

let transporter = nodemailer.createTransport(smtpConfig);

// setup email data with unicode symbols
let defaultOptions = {
    from: 'UPMC CoMIT <comit@upmc.edu>', // sender address
    to: 'santuccir@upmc.edu', // list of receivers
    subject: 'Test MR Email', // Subject line
    text: 'Hello world', // plain text body
    html: '<b>Hello world</b>' // html body
};

module.exports = (request, response, next) => {
    var email = new emailMessage(request.body.from, request.body.to, request.body.subject, request.body.text);
    // send mail with defined transport object
    transporter.sendMail(email, (error, info) => {
        if (error) {                
            return response.status(500).send({error: error});
        } else {
            console.log('Message %s sent: %s', info.messageId, info.response);
            return response.status(200).send('email sent');
        } 
    });
}