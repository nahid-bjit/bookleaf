const { sendResponse } = require("../util/common");
const UserModel = require("../model/User");
const HTTP_STATUS = require("../constants/statusCodes");

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
}

module.exports = new UserController();
