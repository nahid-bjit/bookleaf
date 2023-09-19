const { body, query, param } = require("express-validator");
const { isValidObjectId } = require("mongoose");

const userValidator = {
    create: [
        body("name")
            .exists()
            .withMessage("Name was not provided")
            .bail()
            .notEmpty()
            .withMessage("Name cannot be empty")
            .bail()
            .isString()
            .withMessage("Name must be a string")
            .isLength({ max: 30 })
            .withMessage("Name cannot be more than 30 characters"),
        body("email")
            .exists()
            .withMessage("Email was not provided")
            .bail()
            .notEmpty()
            .withMessage("Email cannot be empty")
            .bail()
            .isString()
            .withMessage("Email must be a string")
            .bail()
            .isEmail()
            .withMessage("Email format is incorrect"),
        body("address.area")
            .exists()
            .withMessage("Area was not provided")
            .bail()
            .isString()
            .withMessage("Area must be a string"),
        body("address.city")
            .exists()
            .withMessage("City was not provided")
            .bail()
            .isString()
            .withMessage("City must be a string"),
        body("address.country")
            .exists()
            .withMessage("Country was not provided")
            .bail()
            .isString()
            .withMessage("Country must be a string"),
    ],
};

const bookValidator = {
    add: [
        body("title")
            .exists()
            .withMessage("book title must be provided")
            .bail()
            .isString()
            .withMessage("book title must be a string")
            .bail()
            .isLength({ min: 10 })
            .withMessage("book title must be at least 10 characters long"),
        body("description")
            .exists()
            .withMessage("book description must be provided")
            .bail()
            .isString()
            .withMessage("book description must be a string")
            .bail()
            .isLength({ min: 30 })
            .withMessage("book description must be at least 30 characters long"),
        body("price")
            .exists()
            .withMessage("book price must be provided")
            .bail()
            .isNumeric()
            .withMessage("book price must be a number")
            .bail()
            .isFloat({ min: 1 })
            .withMessage("book price must be greater than 0"),
        body("stock")
            .exists()
            .withMessage("book stock must be provided")
            .bail()
            .isNumeric()
            .withMessage("book stock must be a number")
            .bail()
            .isInt({ min: 1 })
            .withMessage("book stock must be greater than 0"),
        body("brand")
            .exists()
            .withMessage("book stock must be provided")
            .bail()
            .isString()
            .withMessage("book brand must be a string"),
    ],
};

const cartValidator = {
    addRemoveItemCart: [
        body("userId")
            .exists()
            .withMessage("User ID must be provided")
            .bail()
            .matches(/^[a-f\d]{24}$/i)
            .withMessage("ID is not in valid mongoDB format"),
        body("bookId")
            .exists()
            .withMessage("Book ID must be provided")
            .bail()
            .matches(/^[a-f\d]{24}$/i)
            .withMessage("ID is not in valid mongoDB format"),
        body("amount")
            .exists()
            .withMessage("Book quantity must be provided")
            .bail()
            .isInt({ min: 1 })
            .withMessage("Quantity must be one or above"),
    ],
};

const authValidator = {
    signup: [
        body("name")
            .exists()
            .withMessage("Name must be provided")
            .bail()
            .isString()
            .withMessage("Name must be a string")
            .bail()
            .matches(/^[a-zA-Z ]*$/)
            .withMessage("Name must be in only alphabets")
            .isLength({ min: 1, max: 100 })
            .withMessage("Name must be between 1 and 100 characters")
            .bail(),
        body("email")
            .exists()
            .withMessage("Email must be provided")
            .bail()
            .isString()
            .withMessage("Email must be a string")
            .bail()
            .isEmail()
            .withMessage("Email must be in valid format"),
        body("password")
            .exists()
            .withMessage("Password must be provided")
            .bail()
            .isString()
            .withMessage("Password must be a string")
            .bail()
            .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minSymbols: 1,
                minNumbers: 1,
            })
            .withMessage(
                "Password must contain at least 8 characters with 1 lower case, 1 upper case, 1 number, 1 symbol"
            ),
        body("confirmPassword")
            .exists()
            .withMessage("Password must be provided")
            .bail()
            .isString()
            .withMessage("Password must be a string")
            .bail()
            .custom((value, { req }) => {
                if (value === req.body.password) {
                    return true;
                }
                throw new Error("Passwords do not match");
            }),
        body("phone")
            .exists()
            .withMessage("Phone number must be provided")
            .bail()
            .isString()
            .withMessage("Phone number must be a string")
            .bail()
            .matches(/(^(\+88|0088)?(01){1}[3456789]{1}(\d){8})$/)
            .withMessage("Phone number must be in a valid format"),
        body("address.area")
            .exists()
            .withMessage("Area was not provided")
            .bail()
            .isString()
            .withMessage("Area must be a string"),
        body("address.city")
            .exists()
            .withMessage("City was not provided")
            .bail()
            .isString()
            .withMessage("City must be a string"),
        body("address.country")
            .exists()
            .withMessage("Country was not provided")
            .bail()
            .isString()
            .withMessage("Country must be a string"),
    ],
};

// module.exports = { userValidator, authValidator, bookValidator, cartValidator };

module.exports = { userValidator, authValidator, bookValidator, cartValidator };
