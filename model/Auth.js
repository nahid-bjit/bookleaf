const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: Number, // 1 = admin, 2 = regular
            required: false,
            default: 2,
        },
        verified: {
            type: Boolean,
            required: false,
            default: false,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: false
        },

        resetPassword: {
            type: Boolean || null,
            required: false,
            default: false,
        },

        resetPasswordToken: {
            type: String || null,
            required: false,
            default: false,
        },


        resetPasswordExpire: {
            type: Date || null,
            require: false,
            default: null,
        }
    },
    { timestamps: true }
);

const Auth = mongoose.model("Auth", authSchema);
module.exports = Auth;