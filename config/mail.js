const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "41e0757bdc3d74",
        pass: "701246393cad6e"
    }
});

module.exports = transporter;


