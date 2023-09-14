const express = require("express");
const routes = express();
const BookController = require("../controller/BookController")


routes.get("/all", BookController.getAll);

module.exports = routes;