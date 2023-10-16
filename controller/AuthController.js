const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
// const { failure, success } = require("../util/common");
const { sendResponse } = require("../util/common")
const bcrypt = require("bcrypt");
const Auth = require("../model/Auth");
const User = require("../model/User");
const jsonwebtoken = require("jsonwebtoken");
const transporter = require("../config/mail")
const { promisify } = require("util");
const ejs = require("ejs");

const ejsRenderFile = promisify(ejs.renderFile);
const crypto = require("crypto");
const path = require("path");
const { default: mongoose } = require("mongoose");

class AuthController {
    async login(req, res) {
        console.log("req: ", req)

        try {

            const validation = validationResult(req).array();
            console.log("validation: ", validation)
            if (validation.length > 0) {
                console.log("meow 2")
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Failed to add the user", validation);
            }

            console.log("req body: ", req.body)

            const { email, password } = req.body;
            const auth = await Auth.findOne({ email: email })
                .populate("user", "-createdAt -updatedAt")
                .select("-createdAt -updatedAt");

            console.log("auth: ", auth)

            if (!auth) {
                console.log("meow 3")
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "User is not registered");
            }

            const checkPassword = await bcrypt.compare(password, auth.password);

            if (!checkPassword) {
                console.log("meow 4")
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
            }

            const responseAuth = auth.toObject();
            delete responseAuth.password;

            const jwt = jsonwebtoken.sign(responseAuth, process.env.SECRET_KEY, { expiresIn: "24h" });

            responseAuth.token = jwt;
            return sendResponse(res, HTTP_STATUS.OK, "Successfully logged in", responseAuth);
        } catch (error) {
            // console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }



    async signup(req, res) {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return sendResponse(res, HTTP_STATUS.OK, "Failed to add the user", validation);
            }

            const { name, email, password, phone, address, role } = req.body;
            const auth = await Auth.findOne({ email: email });

            if (auth) {
                return sendResponse(res, HTTP_STATUS.OK, "Email is already registered");
            }

            const hashedPassword = await bcrypt.hash(password, 10).then((hash) => {
                return hash;
            });

            const user = await User.create({
                name: name,
                email: email,
                phone: phone,
                address: address,
            });

            const result = await Auth.create({
                email: email,
                password: hashedPassword,
                user: user._id,
                verified: false,
                role: role,
            });

            if (!result) {
                return sendResponse(res, HTTP_STATUS.OK, "Failed to add the user");
            }

            return sendResponse(res, HTTP_STATUS.OK, "Successfully signed up", user);
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    async sendForgotPasswordEmail(req, res) {
        try {
            const { email } = req.body;
            if (!email || email === "") {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Recipient email was not provided ");
            }

            const auth = await Auth.findOne({ email: email }).populate("user");

            if (!auth) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User not found");
            }

            const resetToken = crypto.randomBytes(32).toString("hex");
            auth.resetPasswordToken = resetToken;
            auth.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
            auth.resetPassword = true;

            await auth.save();

            const resetURL = path.join(process.env.FRONTEND_URL, "reset-password", resetToken, auth._id.toString());
            const htmlBody = await ejsRenderFile(path.join(__dirname, "..", "views", "forgot-password.ejs"), {
                name: auth.user.name,
                resetURL: resetURL,
            });

            const result = await transporter.sendMail({
                from: "bookleaf.com",
                to: `${auth.user.name} ${email}`,
                subject: "Forgot Password?",
                html: htmlBody,
            });

            if (result.messageId) {
                return sendResponse(res, HTTP_STATUS.OK, "Successfully requested for resetting password ");
            }
            return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Something went wrong!");
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Something went wrong!");
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, userId, newPassword, confirmPassword } = req.body;
            console.log("req body: ", req.body)

            const auth = await Auth.findOne({ _id: new mongoose.Types.ObjectId(userId) });
            if (!auth) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Invalid request");
            }

            if (auth.resetPasswordExpire < Date.now()) {
                return sendResponse(res, HTTP_STATUS.GONE, "Expired request");
            }

            if (auth.resetPasswordToken !== token || auth.resetPassword === false) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Passwords do not match");
            }

            if (await bcrypt.compare(newPassword, auth.password)) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Invalid Token ");
            }

            if (newPassword !== confirmPassword) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Passwords do not match");
            }

            if (await bcrypt.compare(newPassword, auth.password)) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Password cannot be same as the old password")
            }

            //write validations...

            const hashedPassword = await bcrypt.hash(newPassword, 10).then((hash) => {
                return hash;
            });

            const result = await Auth.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(userId) },
                {
                    password: hashedPassword,
                    resetPassword: false,
                    resetPasswordExpire: null,
                    resetPasswordToken: null,
                }
            )

            // write code to save the new password

            if (result.isModified) {
                return sendResponse(res, HTTP_STATUS.OK, "Successfully updated password");
            }
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Something went wrong!");
        }
        // return sendResponse(res, HTTP_STATUS.OK, "Request is still valid");
    }

    async validatePasswordResetRequest(req, res) {
        try {
            const { token, userId } = req.body;

            const auth = await Auth.findOne({ _id: new mongoose.Types.ObjectId(userId) });
            if (!auth) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Invalid request");
            }

            if (auth.resetPasswordExpire < Date.now()) {
                return sendResponse(res, HTTP_STATUS.GONE, "Expired request");
            }

            if (auth.resetPasswordToken !== token || auth.resetPassword === false) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Invalid token");
            }
            return sendResponse(res, HTTP_STATUS.OK, "Request is still valid");
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Something went wrong!");
        }
    }
}


module.exports = new AuthController();
