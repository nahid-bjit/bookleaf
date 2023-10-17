const express = require("express");
const routes = express();
const upload = require("../config/files");
const FileController = require("../controller/FileController");
const { MulterError } = require("multer");
const { sendResponse } = require("../util/common");

routes.post(
    "/upload-file",
    upload.single("file_to_upload"),
    // (req, res, next) => {
    //     console.log(req.file);
    //     if (!req.file) {
    //         return sendResponse(res, 404, "File too large, or file not found");
    //     }
    //     return sendResponse(res, 200, "Successfully uploaded file");
    //     // if (!req.file) {
    //     //     return sendResponse(res, 413, "File not found");
    //     // }
    //     // if (err) {
    //     //     console.log(err instanceof MulterError);
    //     //     console.log(err);
    //     //     return sendResponse(res, 413, "File too large");
    //     // } else {
    //     //     // next();
    //     // }
    // }
    FileController.uploadFile
);
// routes.post("/create", isAuthenticated, isAdmin, productValidator.add, ProductController.create);

module.exports = routes;
