const { sendResponse } = require("../util/common");
const UserModel = require("../model/User");
const HTTP_STATUS = require("../constants/statusCodes");
const { validationResult } = require("express-validator");

class UserController {
    async getAll(req, res) {
        try {
            const users = await UserModel.find({});
            if (users.length > 0) {
                const response = {
                    result: users,
                    total: users.length
                };
                sendResponse(res, HTTP_STATUS.OK, "Successfully received all users", response);
            } else {
                sendResponse(res, HTTP_STATUS.OK, "No users were found");
            }
        } catch (error) {
            sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    async getOneById(req, res) {
        try {
            const { id } = req.params;
            const user = await UserModel.findOne({ _id: id });

            if (user) {
                // Use sendResponse to send a success response
                sendResponse(res, HTTP_STATUS.OK, "Successfully received the user", user);
            } else {
                // Use sendResponse to send an error response
                sendResponse(res, HTTP_STATUS.OK, "User does not exist", null);
            }
        } catch (error) {
            console.log(error);
            // Use sendResponse to send an error response
            sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error", null);
        }
    }

    async create(req, res) {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                // Use sendResponse to send a validation failure response
                sendResponse(res, HTTP_STATUS.OK, "Failed to add the user", validation);
                return;
            }
            const { name, rank, email, address, role } = req.body;

            const emailCheck = await UserModel.findOne({ email: email });
            if (emailCheck) {
                // Use sendResponse to send an error response
                sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "User with email already exists", null);
                return;
            }

            const user = await UserModel.create({
                name: name,
                rank: rank,
                email: email,
                role: role,
                address: {
                    house: address.house,
                    road: address.road,
                    area: address.area,
                    city: address.city,
                    country: address.country,
                },
            });

            if (user) {
                // Use sendResponse to send a success response
                sendResponse(res, HTTP_STATUS.OK, "Successfully added the user", user);
            } else {
                // Use sendResponse to send an error response
                sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to add the user", null);
            }
        } catch (error) {
            console.log(error);
            // Use sendResponse to send an error response
            sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error", null);
        }
    }

    async updateById(req, res) {
        try {
            const { id } = req.params;
            const updatedData = req.body;

            // Check if the document exists before updating
            const existingDocument = await UserModel.findOne({ _id: id });

            if (!existingDocument) {
                // Use sendResponse to send an error response
                sendResponse(res, HTTP_STATUS.BAD_REQUEST, "Document not found");
                return; // Return early to avoid further processing
            }

            // Attempt to update the document
            const result = await UserModel.updateOne({ _id: id }, { $set: updatedData });
            sendResponse(res, HTTP_STATUS.OK, "Successfully updated the product");

        } catch (error) {
            console.log("error: ", error);
            // Use sendResponse to send an error response
            sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    async deleteById(req, res) {
        try {
            const { id } = req.params;
            const result = await UserModel.deleteOne({ _id: id });

            if (result.deletedCount > 0) {
                // Use sendResponse to send a success response
                sendResponse(res, 200, "Successfully deleted the product");
            } else {
                // Use sendResponse to send an error response
                sendResponse(res, 400, "Data not found");
            }
        } catch (error) {
            // Use sendResponse to send an error response
            sendResponse(res, 500, "Internal server error");
        }
    }



}


module.exports = new UserController();

