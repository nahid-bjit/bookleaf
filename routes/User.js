const express = require("express");
const routes = express();
const UserController = require("../controller/UserController");






routes.get("/all", UserController.getAll);
//routes.get("/detail/:id", UserController.getOneById);

module.exports = routes;