const express = require("express");
const routes = express();
const UserValidator = require("../middleware/validation")
const UserController = require("../controller/UserController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");







routes.get("/all", isAuthenticated, isAdmin, UserController.getAll);
routes.get("/detail/:id", isAuthenticated, isAdmin, UserController.getOneById);
// routes.post("/create", isAuthenticated, isAdmin, UserValidator.create, UserController.create);
routes.post("/create", isAuthenticated, isAdmin, UserController.create);
routes.patch("/update/:id", isAuthenticated, isAdmin, UserController.updateById);
routes.delete("/delete/:id", isAuthenticated, isAdmin, UserController.deleteById);



module.exports = routes;