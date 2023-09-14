const mongoose = require('mongoose');

// Define the review schema
const reviewSchema = new mongoose.Schema({
    user: String,
    text: String,
    rating: Number,
});

// Define the book schema
const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    description: String,
    price: Number,
    stock: Number,
    reviews: [reviewSchema], // Embed reviews as an array of objects
});

// Create the Book model
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
