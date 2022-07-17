const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    eventDate: {
        type: Date,
    },
    photos: {
        type: Array,
    },
    privacy: {
        type: Boolean,
    },
    userId: {
        type: mongoose.ObjectId
    },
});

const Blog = mongoose.model('Blog', BlogSchema);

module.exports = Blog;
