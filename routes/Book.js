const express = require("express");
const routes = express();
const { userValidator, bookValidator, getAllValidator, validate } = require("../middleware/validation");
const BookController = require("../controller/BookController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const upload = require("../config/files");


routes.get("/all",
    //getAllValidator, 
    //validate, 
    BookController.getAll);
routes.get("/detail/:id", BookController.getOneById);
//routes.post("/addBook", isAuthenticated, isAdmin, bookValidator.add, BookController.create);
//routes.post("/add", isAuthenticated, isAdmin, bookValidator.add, BookController.create);
routes.post("/add", upload.single("file_to_upload"), BookController.create);
routes.delete("/delete/:id", BookController.deleteById);
routes.patch("/update/:id", BookController.updateById);
// routes.delete("/delete/:id", isAuthenticated, isAdmin, BookController.deleteById);
// routes.patch("/update/:id", isAuthenticated, isAdmin, bookValidator.edit, BookController.updateById);
routes.post("/give-discount", isAuthenticated, isAdmin, BookController.giveDiscount);
routes.patch("/update-discount", BookController.updateDiscount);


module.exports = routes;