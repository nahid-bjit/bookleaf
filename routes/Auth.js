const express = require("express");
const routes = express();
const AuthController = require("../controller/AuthController");
const { authValidator } = require("../middleware/validation");
// const { userValidator } = require("../middleware/validation");

// routes.get("/all", UserController.getAll);
// routes.get("/detail/:id", UserController.getOneById);
// routes.post("/create", userValidator.create, UserController.create);

routes.post("/login",
    authValidator.login,
    AuthController.login);
routes.post("/sign-up",
    //authValidator.signup, 
    AuthController.signup);

routes.post("/forget-password", AuthController.sendForgotPasswordEmail);
routes.post("/check-token", AuthController.validatePasswordResetRequest);
routes.post("/reset-password", AuthController.resetPassword);




module.exports = routes;
