const express = require("express");
const routes = express();
const { sendResponse } = require("../util/common");
const data = require("../data/homepage");
const transporter = require("../config/mail");
const HTTP_STATUS = require("../constants/statusCodes");

routes.post("/send", async (req, res) => {
    const { body, recipient, sender, subject } = req.body;
    console.log("request body: ", req.body)
    const result = await transporter.sendMail({
        from: sender,
        to: recipient,
        subject: subject,
        html: body,
    });

    return sendResponse(res, HTTP_STATUS.OK, "Successfully sent email transactions", result);
});

routes.get("/hello", (req, res) => {
    return res.render("hello.ejs", data);
});
routes.get("/test", (req, res) => {
    return res.render("mail.ejs", { name: "Snigdho Dip Howlader" });
});

module.exports = routes;
