
import nodemailer from 'nodemailer'

const sendEmail = async function(email, subject, message) {
    // const transporter = nodemailer.createTransport({
    //     host: "smtp.forwardemail.net",
    //     port: 465,
    //     secure: true,
    //     auth: {
    //       // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    //       user: process.env.SMTP_USERNAME,
    //       pass: process.env.SMTP_PASSWORD,
    //     },
    //   });


    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        }
    });
      
      
        // send mail with defined transport object
        const info = await transporter.sendMail({
          from: process.env.SMTP_USERNAME, // sender address
          to: email, // list of receivers
          subject: subject, // Subject line
          text: message, // plain text body
        //   html: "<b>Hello world?</b>", // html body
        });
      
        console.log("Message sent: %s", info.messageId);
}

export default sendEmail;