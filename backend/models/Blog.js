const mongoose = require("mongoose")

const BlogSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        image: {
            type: String,
            required: true
        },
        content: [
            {
                type: {
                    type: String
                },
                value: mongoose.Schema.Types.Mixed
            }
        ],
        readTime: Number,
    },
    {
        timestamps: true
    }

)

module.exports = mongoose.model('Blog',BlogSchema)