const mongoose = require("mongoose")

const BlogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        author: {
            type: String,
            required: true
        },
        authorImage: {
            type: String
        },
        image: {
            type: String,
            required: true
        },
        excerpt: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        readTime: {
            type: Number,
            required: true
        },
    },
    {
        timestamps: true
    }

)

module.exports = mongoose.model('Blog',BlogSchema)