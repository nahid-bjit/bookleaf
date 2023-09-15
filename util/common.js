const sendResponse = (res, status, message, result = null) => {
    const response = {};
    if (status >= 400) {
        response.success = false;
        response.error = result;
        response.message = "Internal server error";
    } else {
        response.success = true;
        response.data = result;
        response.message = "Successfully completed operation";
    }

    if (message) {
        response.message = message;
    }
    res.status(status).send(response);
};

module.exports = { sendResponse }

// ## Old Module ##

// const success = (message, data = null) => {
//     return {
//         success: true,
//         message: message,
//         data: data,
//     };
// };

// const failure = (message, error = null) => {
//     return {
//         success: false,
//         message: message,
//         error: error,
//     };
// };

// module.exports = { success, failure };