const express = require("express");
const routes = express();
const { userValidator, validate } = require("../middleware/validation")
const UserController = require("../controller/UserController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");


routes.get("/all", isAuthenticated, isAdmin, UserController.getAll);
routes.get("/detail/:id", isAuthenticated, isAdmin, UserController.getOneById);
routes.post("/create", isAuthenticated, isAdmin, userValidator.create, UserController.create);
routes.patch("/update/:id", isAuthenticated, isAdmin, UserController.updateById);
routes.delete("/delete/:id", isAuthenticated, isAdmin, UserController.deleteById);
routes.patch("/update-balance/:id", isAuthenticated, UserController.updateBalance);



module.exports = routes;