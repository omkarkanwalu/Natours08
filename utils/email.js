const nodemailer = require('nodemailer');
const Transport = require('nodemailer-brevo-transport');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `omkar kanwalu  <${process.env.EMAIL_FROM}`;
  }

  // newTransport() {
  //   if (process.env.NODE_ENV === 'production') {
  //     //
  //     return 1;
  //   }

  //   return nodemailer.createTransport({
  //     host: process.env.EMAIL_HOST,
  //     port: process.env.EMAIL_PORT,
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       pass: process.env.EMAIL_PASSWORD,
  //     },
  //   });
  // }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        // service: 'SendinBlue',
        host: process.env.SENDINBLUE_HOST,
        port: process.env.SENDINBLUE_PORT,

        auth: {
          user: 'omkarkanwalu@gmail.com',
          // pass: process.env.SMTP_KEY,
          pass: process.env.SMTP_KEY,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your Password reset token (valid for only 10 min)'
    );
  }
};
