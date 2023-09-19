const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            maxlength: 30,
        },
        email: {
            type: String,
            required: true,
        },
        role: {
            type: Number, // 1 = admin, 2 = regular
            required: false,
            default: 2,
        },
        phone: {
            type: String,
            required: false,
        },
        balance: {
            type: Number,
            default: 0,
        },
        address: {
            house: String,
            road: String,
            area: {
                type: String,
                required: false,
            },
            city: {
                type: String,
                required: false,
            },
            country: {
                type: String,
                required: false,
            }
        },
        verified: {
            type: Boolean,
            required: false,
            default: false,
        }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;