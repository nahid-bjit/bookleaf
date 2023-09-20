const { sendResponse } = require("../util/common");
const UserModel = require("../model/User");
const AuthModel = require("../model/Auth");
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

            // Attempt to update the document and retrieve the updated object
            const updatedUser = await UserModel.findOneAndUpdate({ _id: id }, { $set: updatedData }, { new: true });

            if (updatedUser) {
                // Include the updated user object in the response JSON
                const response = {
                    message: "Successfully updated the product",
                    updatedUser // Include the updated user object here
                };

                sendResponse(res, HTTP_STATUS.OK, response);
            } else {
                sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to update the product");
            }
        } catch (error) {
            console.log("error: ", error);
            // Use sendResponse to send an error response
            sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }


    async deleteById(req, res) {
        try {
            const { id } = req.params;

            // Check if the user exists before deleting
            const existingUser = await UserModel.findOne({ _id: id });

            if (!existingUser) {
                // Use sendResponse to send an error response
                return sendResponse(res, 400, "User not found");
            }

            // Attempt to delete the user
            const userDeleteResult = await UserModel.deleteOne({ _id: id });

            if (userDeleteResult.deletedCount > 0) {
                // Check and delete the corresponding entry in the 'auth' collection
                await AuthModel.deleteOne({ userId: id });

                // Use sendResponse to send a success response
                return sendResponse(res, 200, "User and associated data successfully deleted");
            } else {
                // Use sendResponse to send an error response
                return sendResponse(res, 400, "User data not found");
            }
        } catch (error) {
            // Use sendResponse to send an error response
            return sendResponse(res, 500, "Internal server error");
        }
    }


    async updateBalance(req, res) {
        try {
            const userId = req.params.id; // Assuming you're passing the user ID as a URL parameter
            const newBalance = req.body.balance;

            console.log("userId: ", userId);
            console.log("newBalance: ", newBalance)

            // Find the user by their ID
            const user = await UserModel.findOne({ _id: userId });

            if (!user) {
                return sendResponse(res, 404, 'User not found');
            }

            // Update the user's balance
            user.balance += newBalance;
            console.log("new balance: ", newBalance)
            // Save the updated user
            await user.save();

            // Include newBalance in the response JSON
            const response = {
                message: 'Balance updated successfully',
                newBalance: user.balance // Include newBalance in the response
            };

            return sendResponse(res, 200, response);
        } catch (error) {
            console.error(error);
            return sendResponse(res, 500, 'Internal server error');
        }
    }



}


module.exports = new UserController();

