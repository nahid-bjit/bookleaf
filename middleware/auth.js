const { sendResponse } = require("../util/common");
const jsonwebtoken = require("jsonwebtoken");
const HTTP_STATUS = require("../constants/statusCodes");

const isAuthenticated = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized access");
        }
        const jwt = req.headers.authorization.split(" ")[1];
        //console.log("jwt: ", jwt)
        const validate = jsonwebtoken.verify(jwt, process.env.SECRET_KEY);
        // console.log("userId from jwt: ", validate)

        if (validate) {
            // console.log("userId: ", req.user)
            req.user = validate.user;
            next();
        } else {
            throw new Error();
        }
    } catch (error) {
        // console.log(error);
        if (error instanceof jsonwebtoken.JsonWebTokenError) {
            return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Token invalid");
        }
        if (error instanceof jsonwebtoken.TokenExpiredError) {
            return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Please log in again");
        }
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Something went wrong");
    }
};

const isAdmin = (req, res, next) => {
    try {
        const jwt = req.headers.authorization.split(" ")[1];
        const validate = jsonwebtoken.decode(jwt);
        if (validate.role === 1) {
            next();
        } else {
            return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized access");
        }
    } catch (error) {
        console.log(error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Something went wrong");
    }
};

const isUser = (req, res, next) => {
    try {
        console.log("headers: ", req.headers.authorization)
        const jwt = req.headers.authorization.split(" ")[1];
        const validate = jsonwebtoken.decode(jwt);
        if (validate.role === 2) {
            next();
        } else {
            return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized access");
        }
    } catch (error) {
        console.log(error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Something went wrong");
    }
};

module.exports = { isAuthenticated, isAdmin, isUser };
