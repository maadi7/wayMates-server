const nodemailer = require('nodemailer');
const ReactDOMServer = require('react-dom/server');
// const { renderVerificationEmailToHTML } = require('../emails/VerificationEmail');


// Function to send email
async function sendVerificationEmail(to, username, otp) {
  try {
    // Render the VerificationEmail component to HTML
    // const emailHTML = ReactDOMServer.renderToString(
    //   VerificationEmail({ username, otp })
    // );

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Replace with your SMTP server host
      port: 587, // Replace with your SMTP server port
      secure: false, // Change to true if your SMTP server requires SSL/TLS
      auth: {
        user: 'mishraadi733@gmail.com', // Replace with your SMTP server username
        pass: 'twbz twws ukct mzld', // Replace with your SMTP server password
      },
    });

    // Define email options
    const mailOptions = {
      from: 'mishraadi733@gmail.com', // Replace with your sender email address
      to,
      subject: 'Verification Code for WayMates',
      html: `<p>hii ${username} your otp for WayMates is ${otp}</p>`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
}

module.exports = sendVerificationEmail;
