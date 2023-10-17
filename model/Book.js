const mongoose = require("mongoose")

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    description: String,
    price: Number,
    stock: Number,
    discountedPrice: Number, // The price after applying the discount
    discountPercentage: Number, // The discount percentage (e.g., 10%)
    discountEndDate: Date, // The date when the discount ends
    rating: Number,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review',
        },
    ],
    image: String,
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
