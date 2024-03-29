const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: process.env.SENDGRID_EMAIL,
    subject: 'Thanks for joining in!',
    text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
  })
}

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: process.env.SENDGRID_EMAIL,
    subject: 'Sorry to see you go!',
    text: `Good bye, ${name}. I hope to see you back sometime soon.`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}