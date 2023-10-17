const multer = require("multer");
const fileTypes = require("../constants/fileTypes");
const path = require("path");

const upload = multer({
    limits: {
        // fileSize: 1073741824,
        fileSize: 1073741824 / 2,
    },
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            if (file) {
                callback(null, "./server/files");
            } else {
                req.file.error = "No file was found";
                callback("No file was found", null);
            }
        },
        filename: (req, file, callback) => {
            if (file) {
                callback(null, Date.now() + "_" + file.originalname);
            } else {
                callback("No file was found", null);
            }
        },
    }),
    fileFilter: (req, file, callback) => {
        if (file) {
            const extension = path.extname(file.originalname);
            // console.log(extension);
            if (fileTypes.includes(extension)) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        } else {
            callback("No file found", false);
        }
    },
});

module.exports = upload;
